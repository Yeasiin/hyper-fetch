import { Socket } from "@hyper-fetch/sockets";
import { waitFor } from "@testing-library/dom";
import { Client } from "@hyper-fetch/core";

import { Tea } from "../../../utils/seed/seed.data";
import { firebaseAdminAdapter, firebaseAdapter, RealtimeSocketAdapterType } from "adapter";

export const onValueTestSuite = (
  adapter: () => RealtimeSocketAdapterType,
  coreAdapter: () => ReturnType<typeof firebaseAdapter> | ReturnType<typeof firebaseAdminAdapter>,
) => {
  describe("when using onValue method", () => {
    let spy = jest.fn();
    const newData = { origin: "Poland", type: "Green", year: 2043, name: "Pou Ran Do Cha", amount: 100 } as Tea;

    const initialize = async () => {
      const client = new Client({ url: "teas/" }).setAdapter(coreAdapter);
      const socket = new Socket({ url: "teas/", adapter: adapter() });
      const pushReq = client
        .createRequest<Tea, Tea>()({
          endpoint: "",
          method: "push",
        })
        .setData(newData);
      const socketBees = new Socket({ url: "bees/", adapter: adapter() });

      return { client, socket, pushReq, socketBees };
    };

    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      spy = jest.fn();
    });

    it("should return unmount function", async () => {
      const { socket } = await initialize();
      const onValueReq = socket.createListener<Tea[]>()({
        name: "",
      });
      const unmount = await onValueReq.listen({ callback: spy });
      expect(unmount).toBeFunction();
    });

    it("should unmount listeners", async () => {
      const { socket, pushReq } = await initialize();
      const onValueReq = socket.createListener<Tea[]>()({
        name: "",
      });
      const unmount = await onValueReq.listen({ callback: spy });

      unmount();

      await pushReq.send();
      await pushReq.send();

      expect(spy).toBeCalledTimes(1);
      expect(socket.adapter.listeners.get(onValueReq.name).size).toBe(0);
    });

    it("should return emptyResource status", async () => {
      const { socketBees } = await initialize();
      const onValueReq = socketBees.createListener<Tea[]>()({
        name: "",
        options: { onlyOnce: false },
      });

      let receivedData;
      let receivedExtra;

      const unmount = await onValueReq.listen({
        callback: ({ data, extra }) => {
          spy();
          receivedData = data;
          receivedExtra = extra;
        },
      });

      await waitFor(async () => {
        expect(spy).toBeCalled();
        expect(receivedData).toBeNull();
        expect(receivedExtra.status).toBe("emptyResource");
      });

      unmount();
    });

    it("should be called once with onlyOnce option", async () => {
      const { socket, pushReq } = await initialize();
      const onValueReq = socket.createListener<Tea[]>()({
        name: "",
        options: { onlyOnce: true },
      });

      const unmount = await onValueReq.listen({
        callback: spy,
      });

      await pushReq.send();

      await waitFor(async () => {
        expect(spy).toBeCalledTimes(1);
      });

      unmount();
    });

    it("should receive updates", async () => {
      const { socket, pushReq } = await initialize();

      const onValueReq = socket.createListener<Tea[]>()({
        name: "",
        options: { onlyOnce: false },
      });

      let receivedData;
      let receivedExtra;

      const unmount = await onValueReq.listen({
        callback: ({ data, extra }) => {
          spy();
          receivedData = data;
          receivedExtra = extra;
        },
      });

      await pushReq.send();

      await waitFor(async () => {
        expect(spy).toBeCalledTimes(1);
        expect(receivedData).toIncludeAllMembers([newData]);
        expect(receivedExtra).toHaveProperty("snapshot");
        expect(receivedExtra).toHaveProperty("status");
        expect(receivedExtra).toHaveProperty("ref");
        expect(receivedExtra.status).toBe("success");
      });

      unmount();
    });
  });
};
