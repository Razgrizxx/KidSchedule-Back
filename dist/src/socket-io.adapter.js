"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class CustomIoAdapter extends platform_socket_io_1.IoAdapter {
    createIOServer(port, options) {
        return super.createIOServer(port, {
            ...options,
            path: '/api/v1/socket.io',
        });
    }
}
exports.CustomIoAdapter = CustomIoAdapter;
//# sourceMappingURL=socket-io.adapter.js.map