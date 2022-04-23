import { act, renderHook } from "@testing-library/react-hooks";
import MockAdaper from "axios-mock-adapter";
import { useAuth, AuthProvider } from "../../hooks/Auth";
import api from "../../services/api";

const apiMock = new MockAdaper(api);

const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

describe("Auth Hook", () => {
  it("should be able sign in", async () => {
    const apiResponse = {
      user: {
        id: "user123",
        name: "John Doe",
        email: "johndoe@email.com",
      },
      token: "token654321",
    };
    apiMock.onPost("sessions").reply(200, apiResponse);
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: "johndoe@email.com",
      password: "123456",
    });
    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(
      "@gobarber:token",
      apiResponse.token
    );

    expect(setItemSpy).toHaveBeenCalledWith(
      "@gobarber:user",
      JSON.stringify(apiResponse.user)
    );

    expect(result.current.user.email).toEqual("johndoe@email.com");
  });

  it("should restore saved data from storage when auth inits", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      switch (key) {
        case "@gobarber:token":
          return "token654321";
        case "@gobarber:user":
          return JSON.stringify({
            id: "user123",
            name: "John Doe",
            email: "johndoe@email.com",
          });
        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual("johndoe@email.com");
  });

  it("should be able sign out", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      switch (key) {
        case "@gobarber:token":
          return "token654321";
        case "@gobarber:user":
          return JSON.stringify({
            id: "user123",
            name: "John Doe",
            email: "johndoe@email.com",
          });
        default:
          return null;
      }
    });

    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledTimes(2);
    expect(result.current.user).toBeUndefined();
  });

  it("should be able to update user data", async () => {
    const spySetItem = jest.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    const user = {
      id: "user123",
      name: "John Doe",
      email: "johndoe@email.com",
      avatar_url: "imageLogo",
    };
    act(() => {
      result.current.updateUser(user);
    });

    expect(spySetItem).toHaveBeenCalledWith(
      "@gobarber:user",
      JSON.stringify(user)
    );

    expect(result.current.user).toEqual(user);
  });
});
