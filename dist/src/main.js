"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const socket_io_adapter_1 = require("./socket-io.adapter");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    app.useWebSocketAdapter(new socket_io_adapter_1.CustomIoAdapter(app));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`KidSchedule API running on http://localhost:${port}/api/v1`);
}
bootstrap();
//# sourceMappingURL=main.js.map