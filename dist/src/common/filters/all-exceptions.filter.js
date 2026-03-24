"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AllExceptionsFilter = class AllExceptionsFilter {
    logger = new common_1.Logger('ExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            }
            else if (typeof res === 'object' && res !== null) {
                const body = res;
                if (Array.isArray(body.message)) {
                    message = body.message;
                }
                else if (typeof body.message === 'string') {
                    message = body.message;
                }
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (exception.code === 'P2002') {
                status = common_1.HttpStatus.CONFLICT;
                this.logger.debug(`P2002 meta: ${JSON.stringify(exception.meta)}`);
                const target = exception.meta?.target;
                const rawFields = Array.isArray(target)
                    ? target
                    : typeof target === 'string'
                        ? target.split(',').map((s) => s.trim())
                        : [];
                const fieldLabels = {
                    email: 'El email',
                    phone: 'El teléfono',
                    name: 'El nombre',
                    username: 'El nombre de usuario',
                    inviteCode: 'El código de invitación',
                };
                const readable = rawFields
                    .map((f) => fieldLabels[f] ?? f)
                    .join(' y ');
                message = readable
                    ? `${readable} ya está registrado`
                    : 'Este registro ya existe';
            }
            else if (exception.code === 'P2025') {
                status = common_1.HttpStatus.NOT_FOUND;
                message = 'Registro no encontrado';
            }
            else {
                this.logger.error(`Prisma error ${exception.code}`, exception.message);
                message = 'Error de base de datos';
            }
        }
        else {
            this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));
        }
        response.status(status).json({
            statusCode: status,
            message,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map