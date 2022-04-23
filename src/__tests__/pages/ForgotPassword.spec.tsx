import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import MockAdaper from "axios-mock-adapter";
import ForgotPassword from "../../pages/ForgotPassword";

import api from "../../services/api";

const apiMock = new MockAdaper(api);

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();

jest.mock("../../hooks/Toast", () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

jest.mock("react-router-dom", () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe("Forgot Password page", () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
    apiMock.resetHandlers();
  });

  it("should be able to make a forgot password request", async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText("E-mail");
    const submitButtom = getByText("Recuperar");

    fireEvent.change(emailField, {
      target: { value: "johndoe@email.com" },
    });
    fireEvent.click(submitButtom);

    apiMock.onPost("/password/forgot").reply(200);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
        })
      );
    });
  });

  it("should not be able to make a forgot password request with wrong email field", async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText("E-mail");
    const submitButtom = getByText("Recuperar");

    fireEvent.change(emailField, {
      target: { value: "invalid-email" },
    });
    fireEvent.click(submitButtom);
    await waitFor(() => {
      expect(mockedAddToast).not.toHaveBeenCalled();
    });
  });

  it("should display an error when forgot password request fails", async () => {
    apiMock.onPost("/password/forgot").replyOnce(400, {
      message: "Bad request!",
    });

    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText("E-mail");
    const submitButtom = getByText("Recuperar");

    fireEvent.change(emailField, {
      target: { value: "johndoe@email.com" },
    });
    fireEvent.click(submitButtom);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
        })
      );
    });
  });

  it("should be able to display the default error message when forgot password request fails", async () => {
    apiMock.onPost("/password/forgot").replyOnce(400, {
      message: "",
    });

    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText("E-mail");
    const submitButtom = getByText("Recuperar");

    fireEvent.change(emailField, {
      target: { value: "johndoe@email.com" },
    });
    fireEvent.click(submitButtom);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          description:
            "Ocorreu um erro ao recuerar a senha, por favor tente novamente mais tarte.",
        })
      );
    });
  });
});
