import React from "react";
import "@testing-library/jest-dom";
import MockAdaper from "axios-mock-adapter";
import { fireEvent, render, waitFor } from "@testing-library/react";
import api from "../../services/api";

import SignUp from "../../pages/SignUp";

const apiMock = new MockAdaper(api);

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();

jest.mock("react-router-dom", () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("../../hooks/Toast", () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe("SignUp page", () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
  });

  it("should be able to sign up", async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText("nome");
    const emailField = getByPlaceholderText("E-mail");
    const passwordField = getByPlaceholderText("Senha");
    const submitButton = getByText("Cadastrar");

    fireEvent.change(nameField, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailField, { target: { value: "johndoe@email.com" } });
    fireEvent.change(passwordField, { target: { value: "12345678" } });
    fireEvent.click(submitButton);
    apiMock.onPost("users").reply(200);
    await waitFor(() => {
      expect(mockedHistoryPush).toBeCalledWith("/");
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
        })
      );
    });
  });

  it("should not be able to sign up with invalid field", async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText("nome");
    const emailField = getByPlaceholderText("E-mail");
    const passwordField = getByPlaceholderText("Senha");
    const submitButton = getByText("Cadastrar");

    fireEvent.change(nameField, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailField, { target: { value: "invalid-email" } });
    fireEvent.change(passwordField, { target: { value: "12345678" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedHistoryPush).not.toBeCalled();
    });
  });

  it("should display an error if signUp fails", async () => {
    apiMock.onPost("users").abortRequest();

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText("nome");
    const emailField = getByPlaceholderText("E-mail");
    const passwordField = getByPlaceholderText("Senha");
    const submitButton = getByText("Cadastrar");

    fireEvent.change(nameField, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailField, { target: { value: "johndoe@email.com" } });
    fireEvent.change(passwordField, { target: { value: "12345678" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
        })
      );
    });
  });
});
