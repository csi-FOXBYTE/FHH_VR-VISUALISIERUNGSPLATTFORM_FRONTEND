"use client";

import { trpc } from "@/server/trpc/client";
import { Box, Button, Input } from "@mui/material";
import { Formik } from "formik";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Home() {
  const { mutate: helloWorldMutation } = trpc.testRouter.sendChat.useMutation();
  const { mutate: errorWorldMutation } =
    trpc.testRouter.errorWorld.useMutation();

  const t = useTranslations();

  const [data, setData] = useState<string[]>([]);

  trpc.testRouter.onChat.useSubscription(undefined, {
    onData: (data) => setData((d) => [...d, JSON.stringify(data)]),
    onError: console.error,
  });

  return (
    <Box>
      <h1>{t("LandingPage.title")}</h1>
      <Formik
        initialValues={{
          username: "",
          text: "",
        }}
        onSubmit={(values) =>
          helloWorldMutation({ text: values.text, userId: values.username })
        }
      >
        {({ handleSubmit, values, handleChange }) => (
          <form onSubmit={handleSubmit}>
            <Input
              name="username"
              required
              placeholder="Username"
              value={values.username}
              onChange={handleChange}
            />
            <Input
              name="text"
              required
              placeholder="Text"
              value={values.text}
              onChange={handleChange}
            />
            <Button type="submit" aria-hidden="true" hidden />
          </form>
        )}
      </Formik>
      <Button onClick={() => errorWorldMutation({ a: "Hallöle", b: false })}>
        Error World
      </Button>
      <ul>
        {data.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </Box>
  );
}
