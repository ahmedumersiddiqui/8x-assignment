import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import axios from 'axios'
import type { ZodType } from 'zod'

import { API_ORIGIN, API_PREFIX } from '@/constants/settings'

type APIErrorResponse = {
  detail?: string | { msg: string }[]
  code?: string
}

export class APIError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'APIError'
  }
}

const forwardedCookie = createIsomorphicFn()
  .client((): string | undefined => undefined)
  .server((): string | undefined => getRequestHeader('cookie'))

const client = axios.create({
  baseURL: `${API_ORIGIN}${API_PREFIX}`,
  withCredentials: true,
})

client.interceptors.request.use((config) => {
  const cookie = forwardedCookie()
  if (cookie) config.headers.set('cookie', cookie)
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error
    const body = error.response?.data as APIErrorResponse | null
    throw new APIError(
      error.response?.status ?? 0,
      errorDetail(body) ?? error.response?.statusText ?? error.message,
      body?.code,
    )
  },
)

const request = async (path: string, method: string, body?: unknown): Promise<unknown> => {
  const response = await client.request({ url: path, method, data: body })
  return response.status === 204 ? undefined : response.data
}

export const API = {
  get: <T>(schema: ZodType<T>, path: string) =>
    request(path, 'GET').then((data) => schema.parse(data)),

  post: <T>(schema: ZodType<T>, path: string, body?: unknown) =>
    request(path, 'POST', body ?? {}).then((data) => schema.parse(data)),

  patch: <T>(schema: ZodType<T>, path: string, body: unknown) =>
    request(path, 'PATCH', body).then((data) => schema.parse(data)),

  delete: <T>(schema: ZodType<T>, path: string) =>
    request(path, 'DELETE').then((data) => schema.parse(data)),

  send: (path: string, method: 'POST' | 'DELETE') =>
    request(path, method).then(() => undefined),
}

const errorDetail = (body: APIErrorResponse | null | undefined) => {
  const detail = body?.detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ')
  return detail ?? undefined
}

export const getAPIErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => (error instanceof Error && error.message ? error.message : fallback)
