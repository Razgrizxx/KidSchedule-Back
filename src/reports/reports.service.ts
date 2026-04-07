import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { GenerateReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  private readonly anthropic = new Anthropic();

  constructor(
    private readonly prisma: PrismaService,
    private readonly familyService: FamilyService,
  ) {}

  async generate(familyId: string, userId: string, dto: GenerateReportDto) {
    await this.familyService.assertMember(familyId, userId);

    const from = new Date(dto.from + 'T00:00:00.000Z');
    const to   = new Date(dto.to   + 'T23:59:59.999Z');

    // ── Fetch all relevant data in parallel ──────────────────────────────────

    const [
      family,
      events,
      custodyEvents,
      expenses,
      messages,
      mediationSessions,
      healthRecords,
      activeMedications,
      allergies,
    ] = await Promise.all([
      this.prisma.family.findUnique({
        where: { id: familyId },
        include: {
          members: {
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
          },
          children: {
            select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
          },
        },
      }),

      this.prisma.event.findMany({
        where: { familyId, startAt: { gte: from, lte: to } },
        orderBy: { startAt: 'asc' },
        include: {
          children: { include: { child: { select: { firstName: true } } } },
          assignedTo: { select: { firstName: true, lastName: true } },
        },
      }),

      this.prisma.custodyEvent.findMany({
        where: { familyId, date: { gte: from, lte: to } },
        orderBy: { date: 'asc' },
        include: { child: { select: { id: true, firstName: true } } },
      }),

      this.prisma.expense.findMany({
        where: { familyId, date: { gte: from, lte: to } },
        orderBy: { date: 'asc' },
        include: { payer: { select: { firstName: true, lastName: true } } },
      }),

      this.prisma.message.findMany({
        where: {
          familyId,
          createdAt: { gte: from, lte: to },
          isSystemMessage: false,
        },
        select: {
          id: true,
          senderId: true,
          createdAt: true,
          sender: { select: { firstName: true, lastName: true } },
        },
      }),

      this.prisma.mediationSession.findMany({
        where: { familyId, createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: 'asc' },
        include: {
          _count: { select: { messages: true } },
          proposals: { where: { status: 'ACCEPTED' }, select: { summary: true } },
        },
      }),

      this.prisma.healthRecord.findMany({
        where: { familyId, date: { gte: from, lte: to } },
        orderBy: { date: 'asc' },
        include: { child: { select: { firstName: true } } },
      }),

      this.prisma.medication.findMany({
        where: { familyId, isActive: true },
        include: { child: { select: { firstName: true } } },
      }),

      this.prisma.allergy.findMany({
        where: { familyId },
        include: { child: { select: { firstName: true } } },
      }),
    ]);

    if (!family) throw new Error('Family not found');

    // ── Summarise raw data for Claude ────────────────────────────────────────

    const parentNames = family.members
      .map((m) => `${m.user.firstName} ${m.user.lastName}`)
      .join(' y ');

    const childNames = family.children
      .map((c) => `${c.firstName} ${c.lastName}`)
      .join(', ');

    // Custody days per parent per child
    const custodyMap: Record<string, Record<string, number>> = {};
    for (const ev of custodyEvents) {
      const childName = ev.child.firstName;
      if (!custodyMap[childName]) custodyMap[childName] = {};
      const parentMember = family.members.find((m) => m.userId === ev.custodianId);
      const parentName = parentMember
        ? `${parentMember.user.firstName} ${parentMember.user.lastName}`
        : ev.custodianId;
      custodyMap[childName][parentName] = (custodyMap[childName][parentName] ?? 0) + 1;
    }

    // Events by type
    const eventsByType: Record<string, number> = {};
    for (const ev of events) {
      eventsByType[ev.type] = (eventsByType[ev.type] ?? 0) + 1;
    }

    // Expenses summary
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const expensesByCategory: Record<string, number> = {};
    const expensesByPayer: Record<string, number> = {};
    for (const e of expenses) {
      expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + Number(e.amount);
      const payerName = `${e.payer.firstName} ${e.payer.lastName}`;
      expensesByPayer[payerName] = (expensesByPayer[payerName] ?? 0) + Number(e.amount);
    }

    // Messages per sender
    const messagesBySender: Record<string, number> = {};
    for (const m of messages) {
      const senderName = m.sender ? `${m.sender.firstName} ${m.sender.lastName}` : 'Desconocido';
      messagesBySender[senderName] = (messagesBySender[senderName] ?? 0) + 1;
    }

    // Build structured context for Claude
    const context = {
      period: { from: dto.from, to: dto.to },
      family: { name: family.name, parents: parentNames, children: childNames },

      custody: {
        totalDays: custodyEvents.length,
        byChildAndParent: custodyMap,
      },

      events: {
        total: events.length,
        byType: eventsByType,
        list: events.map((e) => ({
          date: e.startAt.toISOString().slice(0, 10),
          title: e.title,
          type: e.type,
          children: e.children.map((c) => c.child.firstName).join(', '),
        })),
      },

      expenses: {
        total: Math.round(totalExpenses * 100) / 100,
        currency: expenses[0]?.currency ?? 'ARS',
        byCategory: expensesByCategory,
        byPayer: expensesByPayer,
        pendingCount: expenses.filter((e) => !e.isSettled).length,
        settledCount: expenses.filter((e) => e.isSettled).length,
        list: expenses.map((e) => ({
          date: e.date.toISOString().slice(0, 10),
          description: e.description,
          amount: Number(e.amount),
          category: e.category,
          payer: `${e.payer.firstName} ${e.payer.lastName}`,
          settled: e.isSettled,
        })),
      },

      messages: {
        total: messages.length,
        bySender: messagesBySender,
      },

      mediation: {
        sessionsOpened: mediationSessions.length,
        list: mediationSessions.map((s) => ({
          topic: s.topic,
          status: s.status,
          messages: s._count.messages,
          resolution: s.proposals[0]?.summary ?? null,
        })),
      },

      health: {
        recordsInPeriod: healthRecords.map((r) => ({
          date: r.date.toISOString().slice(0, 10),
          child: r.child.firstName,
          type: r.type,
          title: r.title,
          doctor: r.doctorName ?? null,
        })),
        activeMedications: activeMedications.map((m) => ({
          child: m.child.firstName,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        allergies: allergies.map((a) => ({
          child: a.child.firstName,
          name: a.name,
          severity: a.severity,
        })),
      },
    };

    // ── Generate with Claude ─────────────────────────────────────────────────

    const prompt = `Sos un asistente legal especializado en co-parentalidad. Tu tarea es redactar un informe formal del período de co-parentalidad basado en los datos reales de la familia.

DATOS DE LA FAMILIA:
${JSON.stringify(context, null, 2)}

Redactá un informe completo y profesional en ESPAÑOL, formateado en Markdown, con las siguientes secciones:

# Informe de Co-parentalidad
## Período: ${dto.from} al ${dto.to}
## Familia: ${family.name}

### 1. Resumen Ejecutivo
(Párrafo de 3-4 oraciones resumiendo el período)

### 2. Custodia y Convivencia
(Detalla los días de custodia por hijo y por padre. Usa tablas si hay múltiples hijos)

### 3. Eventos y Actividades
(Resume los eventos del período: escolares, médicos, actividades, vacaciones. Agrupa por tipo)

### 4. Gastos Compartidos
(Total, desglose por categoría, quién pagó qué. Menciona el balance pendiente)

### 5. Comunicación
(Cantidad de mensajes intercambiados. Evaluación general del volumen de comunicación)

### 6. Mediación
(Si hubo sesiones, sus temas y resultados. Si no hubo, mencionarlo)

### 7. Salud y Bienestar
(Visitas médicas del período, medicaciones activas, alergias conocidas)

### 8. Observaciones Finales
(2-3 observaciones objetivas sobre el período. No tomes partido por ningún padre)

---
*Informe generado automáticamente por KidSchedule el ${new Date().toLocaleDateString('es-AR')}*

INSTRUCCIONES:
- Sé formal y objetivo. Nunca juzgues a ningún padre.
- Usa el lenguaje neutro apropiado para documentos legales argentinos.
- Si no hay datos en alguna sección, indicarlo brevemente ("Sin registros en el período").
- Las listas de eventos y gastos deben mostrarse en formato de tabla Markdown cuando haya más de 3 ítems.
- Redactá en tercera persona.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const markdown = (response.content[0] as { text: string }).text.trim();

    return {
      markdown,
      period: { from: dto.from, to: dto.to },
      generatedAt: new Date().toISOString(),
      stats: {
        events: events.length,
        expenses: expenses.length,
        expensesTotal: Math.round(totalExpenses * 100) / 100,
        messages: messages.length,
        custodyDays: custodyEvents.length,
        healthRecords: healthRecords.length,
      },
    };
  }
}
