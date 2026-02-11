import { readStorage, StorageKeys, updateStorage, writeStorage } from './storage.js'

export function getCart() {
  return readStorage(StorageKeys.cart, { items: [] })
}

export function addToCart(item) {
  return updateStorage(
    StorageKeys.cart,
    (cart) => {
      const items = Array.isArray(cart?.items) ? cart.items : []
      const exists = items.some((it) => it.type === item.type && it.id === item.id)
      return exists ? { items } : { items: [...items, item] }
    },
    { items: [] },
  )
}

export function removeFromCart(item) {
  return updateStorage(
    StorageKeys.cart,
    (cart) => ({ items: (cart?.items || []).filter((it) => !(it.type === item.type && it.id === item.id)) }),
    { items: [] },
  )
}

export function clearCart() {
  writeStorage(StorageKeys.cart, { items: [] })
}

