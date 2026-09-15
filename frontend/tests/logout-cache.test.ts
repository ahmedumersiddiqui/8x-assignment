import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { QueryKeys } from '@/constants/query-keys'

const USER = { id: 1, email: 'demo@example.com', name: 'Demo Shopper', is_prime: true }

/** The header's account query: signed in it resolves a user, signed out the 401 is
 *  caught and becomes null, exactly as `accountQuery` does. */
const accountObserver = (client: QueryClient, signedIn: () => boolean) =>
  new QueryObserver(client, {
    queryKey: [QueryKeys.AccountDetails],
    queryFn: () => (signedIn() ? USER : null),
    staleTime: 30_000,
  })

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('signing out has to empty the account cache', () => {
  it('queryClient.clear() leaves a mounted observer holding the old user', async () => {
    // Why the header kept saying "Hello, Demo" after sign-out: clear() drops the query
    // from the cache without resetting observers that are already subscribed, so the
    // header re-rendered from data that no longer had a session behind it.
    const client = new QueryClient()
    let signedIn = true
    const observer = accountObserver(client, () => signedIn)
    const unsubscribe = observer.subscribe(() => {})
    await observer.refetch()
    expect(observer.getCurrentResult().data).toEqual(USER)

    signedIn = false
    client.clear()
    await settle()

    expect(observer.getCurrentResult().data).toEqual(USER)
    unsubscribe()
  })

  it('resetQueries() refetches the subscriber, so the header sees no user', async () => {
    const client = new QueryClient()
    let signedIn = true
    const observer = accountObserver(client, () => signedIn)
    const unsubscribe = observer.subscribe(() => {})
    await observer.refetch()
    expect(observer.getCurrentResult().data).toEqual(USER)

    signedIn = false
    await client.resetQueries()
    await settle()

    expect(observer.getCurrentResult().data).toBeNull()
    unsubscribe()
  })
})
