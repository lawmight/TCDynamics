/**
 * Connect Products Management Page
 *
 * This page allows connected account holders to manage their products.
 * Features include:
 * - Creating new products with pricing
 * - Viewing existing products
 * - Managing product details
 *
 * All operations are performed on the connected account using the
 * Stripe-Account header for proper account isolation.
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createProduct,
  formatConnectPrice,
  listProducts,
  type CreateProductParams,
  type Product,
} from '@/utils/stripeConnect'
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Image,
  Package,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const ConnectProducts = () => {
  const { accountId } = useParams<{ accountId: string }>()

  // State management
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for creating new product
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    priceInCents: '',
    currency: 'usd',
    images: '',
  })

  // Sample products for demo purposes
  const [demoProducts] = useState<Product[]>([
    {
      id: 'prod_demo_1',
      name: 'Premium Widget',
      description: 'A high-quality widget for professional use',
      active: true,
      created: Date.now() / 1000 - 86400, // 1 day ago
      default_price: { unit_amount: 2999, currency: 'usd' },
      images: ['https://via.placeholder.com/300x200?text=Widget'],
      metadata: {},
    },
    {
      id: 'prod_demo_2',
      name: 'Basic Service',
      description: 'Essential service package for small businesses',
      active: true,
      created: Date.now() / 1000 - 172800, // 2 days ago
      default_price: { unit_amount: 4999, currency: 'usd' },
      images: [],
      metadata: {},
    },
  ])

  // Load products on component mount
  useEffect(() => {
    if (accountId) {
      loadProducts()
    }
  }, [accountId])

  /**
   * Load products for the connected account
   *
   * Fetches all active products from the connected account using the
   * Stripe-Account header for proper account isolation.
   */
  const loadProducts = async () => {
    if (!accountId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await listProducts(accountId, 50)

      if (result.success && result.products) {
        setProducts(result.products)
      } else {
        // Use demo products if API fails
        setProducts(demoProducts)
        console.warn('Using demo products:', result.message)
      }
    } catch (error) {
      // Fallback to demo products
      setProducts(demoProducts)
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refresh products list
   */
  const refreshProducts = async () => {
    setIsRefreshing(true)
    await loadProducts()
    setIsRefreshing(false)
  }

  /**
   * Handle creating a new product
   *
   * Creates a product on the connected account with the specified
   * name, description, and pricing information.
   */
  const handleCreateProduct = async () => {
    if (!accountId) {
      setError('Account ID is missing')
      return
    }

    // Validate form data
    if (!newProduct.name.trim()) {
      setError('Product name is required')
      return
    }

    if (!newProduct.description.trim()) {
      setError('Product description is required')
      return
    }

    const priceInCents = parseInt(newProduct.priceInCents)
    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError('Valid price is required')
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const params: CreateProductParams = {
        accountId,
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        priceInCents,
        currency: newProduct.currency,
        images: newProduct.images
          ? newProduct.images.split(',').map(url => url.trim())
          : [],
      }

      const result = await createProduct(params)

      if (result.success && result.product) {
        setSuccess(`Product "${result.product.name}" created successfully!`)
        setNewProduct({
          name: '',
          description: '',
          priceInCents: '',
          currency: 'usd',
          images: '',
        })
        setShowCreateForm(false)
        await refreshProducts()
      } else {
        setError(result.message || 'Failed to create product')
      }
    } catch (error) {
      setError('An unexpected error occurred while creating the product')
      console.error('Error creating product:', error)
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Format product creation date
   */
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/connect/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Product Management
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage products for connected account: {accountId}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={refreshProducts}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  variant="default"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
              </div>
            </div>

            {/* API Info */}
            <Badge variant="outline">
              <Package className="w-3 h-3 mr-1" />
              Connected Account Products
            </Badge>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Card className="mb-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 dark:text-green-400">
                    {success}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Create Product Form */}
            {showCreateForm && (
              <div className="lg:col-span-1">
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20 sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Create Product
                    </CardTitle>
                    <CardDescription>
                      Add a new product to your store
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Premium Widget"
                        value={newProduct.name}
                        onChange={e =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        disabled={isCreating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product..."
                        value={newProduct.description}
                        onChange={e =>
                          setNewProduct({
                            ...newProduct,
                            description: e.target.value,
                          })
                        }
                        disabled={isCreating}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (in cents)</Label>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <Input
                          id="price"
                          type="number"
                          placeholder="2999"
                          value={newProduct.priceInCents}
                          onChange={e =>
                            setNewProduct({
                              ...newProduct,
                              priceInCents: e.target.value,
                            })
                          }
                          disabled={isCreating}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter price in cents (e.g., 2999 = $29.99)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        placeholder="usd"
                        value={newProduct.currency}
                        onChange={e =>
                          setNewProduct({
                            ...newProduct,
                            currency: e.target.value.toLowerCase(),
                          })
                        }
                        disabled={isCreating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="images">
                        Image URLs (comma-separated)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-muted-foreground" />
                        <Input
                          id="images"
                          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                          value={newProduct.images}
                          onChange={e =>
                            setNewProduct({
                              ...newProduct,
                              images: e.target.value,
                            })
                          }
                          disabled={isCreating}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateProduct}
                        disabled={
                          isCreating ||
                          !newProduct.name.trim() ||
                          !newProduct.description.trim()
                        }
                        className="flex-1"
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowCreateForm(false)}
                        variant="outline"
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Preview */}
                    {newProduct.priceInCents && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-2">
                          Price Preview:
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatConnectPrice(
                            parseInt(newProduct.priceInCents) || 0,
                            newProduct.currency
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Products List */}
            <div className={showCreateForm ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Products ({products.length})
                  </CardTitle>
                  <CardDescription>
                    Manage your product catalog and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading products...
                      </p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No products yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first product to start selling
                      </p>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Product
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map(product => {
                        const price = product.default_price
                        const amount =
                          typeof price === 'object' ? price.unit_amount : 0
                        const currency =
                          typeof price === 'object' ? price.currency : 'usd'

                        return (
                          <Card
                            key={product.id}
                            className="bg-muted/30 border-border/50"
                          >
                            <CardContent className="p-4">
                              {/* Product Image */}
                              {product.images && product.images.length > 0 ? (
                                <div className="mb-4">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={e => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="mb-4 bg-muted rounded-lg h-32 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                              )}

                              {/* Product Info */}
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-semibold line-clamp-2">
                                    {product.name}
                                  </h3>
                                  <Badge
                                    variant={
                                      product.active ? 'default' : 'secondary'
                                    }
                                  >
                                    {product.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {product.description}
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                  <div>
                                    <p className="text-lg font-bold text-primary">
                                      {formatConnectPrice(amount, currency)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Created {formatDate(product.created)}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {product.id}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* API Information */}
          <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Connected Account Products
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                    Products are created directly on the connected account using
                    the Stripe-Account header:
                  </p>
                  <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                    <li>
                      • Products belong to the connected account, not the
                      platform
                    </li>
                    <li>
                      • Pricing and inventory are managed by the account holder
                    </li>
                    <li>
                      • Platform earns revenue through application fees on
                      transactions
                    </li>
                    <li>
                      • Account ID in URL:{' '}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                        {accountId}
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ConnectProducts
