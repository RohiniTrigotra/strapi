import * as React from 'react';

import { Box, Button, Flex, Main, Typography } from '@strapi/design-system';
import { Link } from '@strapi/design-system/v2';
import { useQuery } from '@strapi/helper-plugin';
import camelCase from 'lodash/camelCase';
import { useIntl } from 'react-intl';
import { NavLink, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { Form } from '../../../components/Form';
import { InputRenderer } from '../../../components/FormInputs/Renderer';
import { Logo } from '../../../components/UnauthenticatedLogo';
import { useAuth } from '../../../features/Auth';
import {
  UnauthenticatedLayout,
  Column,
  LayoutContent,
} from '../../../layouts/UnauthenticatedLayout';
import { translatedErrors } from '../../../utils/translatedErrors';

import type { Login } from '../../../../../shared/contracts/authentication';

interface LoginProps {
  children?: React.ReactNode;
}

const LOGIN_SCHEMA = yup.object().shape({
  email: yup
    .string()
    .email({
      id: translatedErrors.email.id,
      defaultMessage: 'Not a valid email',
    })
    .required(translatedErrors.required),
  password: yup.string().required(translatedErrors.required),
  rememberMe: yup.bool().nullable(),
});

const Login = ({ children }: LoginProps) => {
  const [apiError, setApiError] = React.useState<string>();
  const { formatMessage } = useIntl();
  const query = useQuery();
  const navigate = useNavigate();

  const login = useAuth('Login', (state) => state.login);

  const handleLogin = async (body: Parameters<typeof login>[0]) => {
    setApiError(undefined);

    const res = await login(body);

    if ('error' in res) {
      const message = res.error.message ?? 'Something went wrong';

      if (camelCase(message).toLowerCase() === 'usernotactive') {
        navigate('/auth/oops');
        return;
      }

      setApiError(message);
    } else {
      const redirectTo = query.get('redirectTo');
      const redirectUrl = redirectTo ? decodeURIComponent(redirectTo) : '/';

      navigate(redirectUrl);
    }
  };

  return (
    <UnauthenticatedLayout>
      <Main>
        <LayoutContent>
          <Column>
            <Logo />
            <Box paddingTop={6} paddingBottom={1}>
              <Typography variant="alpha" as="h1">
                {formatMessage({
                  id: 'Auth.form.welcome.title',
                  defaultMessage: 'Welcome!',
                })}
              </Typography>
            </Box>
            <Box paddingBottom={7}>
              <Typography variant="epsilon" textColor="neutral600">
                {formatMessage({
                  id: 'Auth.form.welcome.subtitle',
                  defaultMessage: 'Log in to your Strapi account',
                })}
              </Typography>
            </Box>
            {apiError ? (
              <Typography id="global-form-error" role="alert" tabIndex={-1} textColor="danger600">
                {apiError}
              </Typography>
            ) : null}
          </Column>
          <Form
            method="PUT"
            initialValues={{
              email: '',
              password: '',
              rememberMe: false,
            }}
            onSubmit={(values) => {
              handleLogin(values);
            }}
            validationSchema={LOGIN_SCHEMA}
          >
            <Flex direction="column" alignItems="stretch" gap={6}>
              {[
                {
                  label: formatMessage({ id: 'Auth.form.email.label', defaultMessage: 'Email' }),
                  name: 'email',
                  placeholder: formatMessage({
                    id: 'Auth.form.email.placeholder',
                    defaultMessage: 'kai@doe.com',
                  }),
                  required: true,
                  type: 'string' as const,
                },
                {
                  label: formatMessage({
                    id: 'global.password',
                    defaultMessage: 'Password',
                  }),
                  name: 'password',
                  required: true,
                  type: 'password' as const,
                },
                {
                  label: formatMessage({
                    id: 'Auth.form.rememberMe.label',
                    defaultMessage: 'Remember me',
                  }),
                  name: 'rememberMe',
                  type: 'checkbox' as const,
                },
              ].map((field) => (
                <InputRenderer key={field.name} {...field} />
              ))}
              <Button fullWidth type="submit">
                {formatMessage({ id: 'Auth.form.button.login', defaultMessage: 'Login' })}
              </Button>
            </Flex>
          </Form>
          {children}
        </LayoutContent>
        <Flex justifyContent="center">
          <Box paddingTop={4}>
            {/* @ts-expect-error – error with inferring the props from the as component */}
            <Link as={NavLink} to="/auth/forgot-password">
              {formatMessage({
                id: 'Auth.link.forgot-password',
                defaultMessage: 'Forgot your password?',
              })}
            </Link>
          </Box>
        </Flex>
      </Main>
    </UnauthenticatedLayout>
  );
};

export { Login };
export type { LoginProps };
