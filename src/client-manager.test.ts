// client-manager.test.ts
import { beforeEach, describe, expect, jest, test } from "bun:test";
import type { ServerWebSocket } from "bun";
import { ClientManager } from "./client-manager";

describe("ClientManager", () => {
    let clientManager: ClientManager;
    let mockWs: ServerWebSocket<unknown>;

    beforeEach(() => {
        clientManager = new ClientManager();
        mockWs = {
            send: jest.fn(),
        } as unknown as ServerWebSocket<unknown>;
    });

    test("should add a client", () => {
        clientManager.addClient(mockWs);
        expect(clientManager.getClient(mockWs)).toBeDefined();
    });

    test("should remove a client", () => {
        clientManager.addClient(mockWs);
        clientManager.removeClient(mockWs);
        expect(clientManager.getClient(mockWs)).toBeUndefined();
    });

    test("should update client timestamp", () => {
        clientManager.addClient(mockWs);
        const before = clientManager.getClient(mockWs)?.lastUpdate;
        expect(before).toBeDefined();
        clientManager.updateClientTimestamp(mockWs);
        const after = clientManager.getClient(mockWs)?.lastUpdate;
        expect(after).toBeDefined();
        expect(after).toBeGreaterThan(before ?? 0);
    });

    test("should broadcast message to all clients", () => {
        const mockWs2 = {
            send: jest.fn(),
        } as unknown as ServerWebSocket<unknown>;
        clientManager.addClient(mockWs);
        clientManager.addClient(mockWs2);
        clientManager.broadcastMessage("test message");
        expect(mockWs.send).toHaveBeenCalledWith("test message");
        expect(mockWs2.send).toHaveBeenCalledWith("test message");
    });
});
