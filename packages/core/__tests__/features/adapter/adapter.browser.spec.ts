/**
 * @jest-environment jsdom
 */
import { adapter, getErrorMessage } from "adapter";
import { resetInterceptors, startServer, stopServer, createRequestInterceptor } from "../../server";
import { Client } from "client";

describe("Fetch Adapter [ Browser ]", () => {
  const requestId = "test";

  let client = new Client({ url: "shared-base-url" });
  let request = client.createRequest()({ endpoint: "/shared-endpoint" });

  beforeAll(() => {
    startServer();
  });

  beforeEach(() => {
    client = new Client({ url: "shared-base-url" });
    request = client.createRequest()({ endpoint: "/shared-endpoint" });

    request.client.requestManager.addAbortController(request.abortKey, requestId);
    resetInterceptors();
    jest.resetAllMocks();
  });

  afterAll(() => {
    stopServer();
  });

  it("should make a request and return success data with status", async () => {
    const data = createRequestInterceptor(request, { fixture: { data: [] } });

    const { data: response, error, status, additionalData } = await adapter(request, requestId);

    expect(response).toStrictEqual(data);
    expect(status).toBe(200);
    expect(error).toBe(null);
    expect(additionalData).toStrictEqual({});
  });

  it("should make a request and return error data with status", async () => {
    const data = createRequestInterceptor(request, { status: 400 });

    const { data: response, error, status, additionalData } = await adapter(request, requestId);

    expect(response).toBe(null);
    expect(status).toBe(400);
    expect(error).toStrictEqual(data);
    expect(additionalData).toStrictEqual({});
  });

  it("should allow to cancel request and return error", async () => {
    createRequestInterceptor(request, { delay: 5 });

    setTimeout(() => {
      request.abort();
    }, 2);

    const { data: response, error } = await adapter(request, requestId);

    expect(response).toBe(null);
    expect(error.message).toEqual(getErrorMessage("abort").message);
  });

  // TODO-fix error.message unknown - timeoutRequest: any
  it("should return timeout error when request takes too long", async () => {
    const timeoutRequest = request.setOptions({ timeout: 5 });
    createRequestInterceptor(timeoutRequest, { delay: 20 });

    const { data: response, error } = await adapter(timeoutRequest, requestId);

    expect(response).toBe(null);
    expect(error.message).toEqual(getErrorMessage("timeout").message);
  });

  it("should not throw when XMLHttpRequest is not available on window", async () => {
    const data = createRequestInterceptor(request, { delay: 20 });
    const xml = window.XMLHttpRequest;
    window.XMLHttpRequest = undefined as any;

    const { data: response, error, status, additionalData } = await adapter(request, requestId);

    expect(response).toStrictEqual(data);
    expect(status).toBe(200);
    expect(error).toBe(null);
    expect(additionalData).toStrictEqual({});
    window.XMLHttpRequest = xml;
  });
});
