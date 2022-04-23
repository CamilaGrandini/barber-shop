/* eslint camelcase: "off" */
import React, { useCallback, useRef } from "react";
import { FiLock } from "react-icons/fi";
import { Form } from "@unform/web";
import * as Yup from "yup";
import { FormHandles } from "@unform/core";
import { useHistory, useLocation } from "react-router-dom";
import logoImg from "../../assets/logo.svg";
import getValidationErrors from "../../utils/getValidationErrors";

import { useToast } from "../../hooks/Toast";

import Input from "../../components/Input";
import Button from "../../components/Button";

import { Container, Content, AnimationContainer, Background } from "./styles";
import api from "../../services/api";

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const history = useHistory();
  const location = useLocation();

  const { addToast } = useToast();

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          password: Yup.string().required("senha obrigatória"),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref("password"), undefined],
            "senhas não conferem"
          ),
        });

        await schema.validate(data, { abortEarly: false });
        const { password, password_confirmation } = data;

        const token = location.search.replace("?token=", "");
        if (!token) {
          throw new Error("O parâmetro token não foi localizado.");
        }
        await api
          .post("password/reset", {
            password,
            password_confirmation,
            token,
          })
          .catch(async (err) => {
            const responseErrorMessage = await err.response.data.message;
            throw new Error(responseErrorMessage);
          });
        history.push("/");
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }
        addToast({
          type: "error",
          title: "Erro ao resetar senha",
          description:
            err.message ||
            "Ocorreu um erro ao resetar sua senha, tente novamente.",
        });
      }
    },
    [addToast, history, location.search]
  );
  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Resetar senha</h1>
            <Input
              name="password"
              type="password"
              icon={FiLock}
              placeholder="Nova senha"
            />
            <Input
              name="password_confirmation"
              type="password"
              icon={FiLock}
              placeholder="Confirmação da senha"
            />
            <Button type="submit">Alterar Senha</Button>
          </Form>
        </AnimationContainer>
      </Content>

      <Background />
    </Container>
  );
};

export default ResetPassword;
