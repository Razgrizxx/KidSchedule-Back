import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
export declare class CustomIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: ServerOptions): any;
}
