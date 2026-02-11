import { useEffect, useState } from 'react'
import { readStorage, subscribeStorage } from './storage.js'

export function useStorageValue(key, fallback) {
  const [value, setValue] = useState(() => readStorage(key, fallback))

  useEffect(() => {
    setValue(readStorage(key, fallback))
    return subscribeStorage(() => setValue(readStorage(key, fallback)))
  }, [key])

  return value
}

