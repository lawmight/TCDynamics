// src/utils/cache/ResourcePool.ts
// Resource pool for managing reusable resources with performance monitoring

import { PerformanceMonitor } from '../performance'

export class ResourcePool<T> {
  private available: T[] = []
  private inUse: Set<T> = new Set()
  private createResource: () => T
  private destroyResource: (resource: T) => void
  private maxSize: number
  private performanceMonitor: PerformanceMonitor

  constructor(
    createResource: () => T,
    destroyResource: (resource: T) => void,
    maxSize: number = 10,
    performanceMonitor: PerformanceMonitor
  ) {
    this.createResource = createResource
    this.destroyResource = destroyResource
    this.maxSize = maxSize
    this.performanceMonitor = performanceMonitor
  }

  async acquire(): Promise<T> {
    return this.performanceMonitor.measureAsync(
      'resource.acquire',
      async () => {
        if (this.available.length > 0) {
          const resource = this.available.pop()
          if (!resource) throw new Error('Failed to acquire resource')
          this.inUse.add(resource)
          return resource
        }

        if (this.inUse.size >= this.maxSize) {
          throw new Error('Resource pool exhausted')
        }

        const resource = this.createResource()
        this.inUse.add(resource)
        return resource
      }
    )
  }

  release(resource: T): void {
    if (this.inUse.has(resource)) {
      this.inUse.delete(resource)
      this.available.push(resource)
      this.performanceMonitor.recordMetric('resource.release', 0)
    }
  }

  destroy(): void {
    // Destroy all resources
    for (const resource of this.available) {
      this.destroyResource(resource)
    }
    for (const resource of this.inUse) {
      this.destroyResource(resource)
    }
    this.available.length = 0
    this.inUse.clear()
  }

  getStats(): {
    available: number
    inUse: number
    total: number
    utilizationRate: number
  } {
    const total = this.available.length + this.inUse.size
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total,
      utilizationRate: total > 0 ? this.inUse.size / total : 0,
    }
  }
}
