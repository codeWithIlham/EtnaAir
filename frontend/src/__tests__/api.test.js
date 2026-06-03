import { describe, it, expect } from 'vitest'
import { getPropertyImage, PROPERTY_IMAGES, CITY_IMAGES } from '../services/api'

const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'

describe('getPropertyImage', () => {
  it('retourne undefined/fallback pour une propriété null', () => {
    expect(getPropertyImage(null)).toBe(FALLBACK)
    expect(getPropertyImage(undefined)).toBe(FALLBACK)
  })

  it('utilise l\'image principale de la DB si elle existe (is_main: true)', () => {
    const property = {
      id: 99,
      city: 'Unknown',
      images: [
        { image_url: 'https://minio/bucket/photo1.jpg', is_main: false },
        { image_url: 'https://minio/bucket/photo2.jpg', is_main: true },
      ],
    }
    expect(getPropertyImage(property)).toBe('https://minio/bucket/photo2.jpg')
  })

  it('utilise la première image DB si aucune n\'est marquée is_main', () => {
    const property = {
      id: 99,
      city: 'Unknown',
      images: [{ image_url: 'https://minio/bucket/first.jpg', is_main: false }],
    }
    expect(getPropertyImage(property)).toBe('https://minio/bucket/first.jpg')
  })

  it('fallback sur PROPERTY_IMAGES[id] quand pas d\'image DB', () => {
    const property = { id: 1, city: 'Inconnu', images: [] }
    expect(getPropertyImage(property)).toBe(PROPERTY_IMAGES[1])
  })

  it('fallback sur CITY_IMAGES[city] quand id inconnu', () => {
    const property = { id: 999, city: 'Paris', images: [] }
    expect(getPropertyImage(property)).toBe(CITY_IMAGES['Paris'])
  })

  it('fallback ultime sur l\'image générique quand rien ne correspond', () => {
    const property = { id: 999, city: 'InconnuCity', images: [] }
    expect(getPropertyImage(property)).toBe(FALLBACK)
  })

  it('fonctionne sans la clé images', () => {
    const property = { id: 1, city: 'Paris' }
    expect(getPropertyImage(property)).toBe(PROPERTY_IMAGES[1])
  })
})

describe('PROPERTY_IMAGES', () => {
  it('contient les 8 propriétés mappées', () => {
    expect(Object.keys(PROPERTY_IMAGES).length).toBe(8)
    for (let i = 1; i <= 8; i++) {
      expect(PROPERTY_IMAGES[i]).toMatch(/^https:\/\/images\.unsplash\.com/)
    }
  })
})

describe('CITY_IMAGES', () => {
  it('contient les 5 villes françaises', () => {
    const cities = ['Paris', 'Lyon', 'Bordeaux', 'Nice', 'Marseille']
    cities.forEach(city => {
      expect(CITY_IMAGES[city]).toMatch(/^https:\/\/images\.unsplash\.com/)
    })
  })
})
