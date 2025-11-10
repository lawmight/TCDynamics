/**
 * Connect Storefront Page
 *
 * This page displays a storefront for customers to browse and purchase
 * products from a specific connected account. Features include:
 * - Displaying products from the connected account
 * - Product search and filtering
 * - Shopping cart functionality
 * - Checkout with Stripe (Direct Charge with application fee)
 *
 * The page uses the connected account's ID in the URL for routing.
 * In production, you should use a different identifier (like a subdomain
 * or custom domain) for better user experience.
 */

import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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
import {
  formatConnectPrice,
  listProducts,
  redirectToConnectCheckout,
  type Product,
} from '@/utils/stripeConnect'

// Shopping cart item interface
interface CartItem {
  product: Product
  quantity: number
}

const ConnectStorefront = () => {
  const { accountId } = useParams<{ accountId: string }>()

  // State management
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check if account is a demo account
  const isDemoAccount = (accountId: string) => {
    return accountId.startsWith('acct_demo_')
  }

  // Sample products for demo purposes
  const [demoProducts] = useState<Product[]>([
    {
      id: 'prod_demo_1',
      name: 'Premium Widget',
      description:
        'A high-quality widget for professional use. Features advanced functionality and premium materials.',
      active: true,
      created: Date.now() / 1000 - 86400,
      default_price: { unit_amount: 2999, currency: 'usd' },
      images: [
        'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Premium+Widget',
      ],
      metadata: {},
    },
    {
      id: 'prod_demo_2',
      name: 'Basic Service Package',
      description:
        'Essential service package for small businesses. Includes setup, training, and basic support.',
      active: true,
      created: Date.now() / 1000 - 172800,
      default_price: { unit_amount: 4999, currency: 'usd' },
      images: [
        'https://via.placeholder.com/400x300/059669/FFFFFF?text=Service+Package',
      ],
      metadata: {},
    },
    {
      id: 'prod_demo_3',
      name: 'Digital Course',
      description:
        'Comprehensive online course covering all aspects of digital marketing and business growth.',
      active: true,
      created: Date.now() / 1000 - 259200,
      default_price: { unit_amount: 1999, currency: 'usd' },
      images: [
        'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Digital+Course',
      ],
      metadata: {},
    },
    {
      id: 'prod_demo_4',
      name: 'Consulting Session',
      description:
        'One-on-one consulting session with industry experts. Personalized advice and strategy planning.',
      active: true,
      created: Date.now() / 1000 - 345600,
      default_price: { unit_amount: 9999, currency: 'usd' },
      images: [
        'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Consulting',
      ],
      metadata: {},
    },
  ])

  // Load products on component mount
  useEffect(() => {
    if (accountId) {
      loadProducts()
    }
  }, [accountId])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [products, searchQuery])

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
   * Add product to cart
   */
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)

      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })

    setSuccess(`Added "${product.name}" to cart`)
    setTimeout(() => setSuccess(null), 3000)
  }

  /**
   * Remove product from cart
   */
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }

  /**
   * Update cart item quantity
   */
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  /**
   * Get total cart value
   */
  const getCartTotal = (): number => {
    return cart.reduce((total, item) => {
      const price =
        typeof item.product.default_price === 'object'
          ? item.product.default_price.unit_amount
          : 0
      return total + price * item.quantity
    }, 0)
  }

  /**
   * Get cart item count
   */
  const getCartItemCount = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * Handle checkout process
   *
   * Creates a checkout session with application fee and redirects
   * to Stripe Checkout for payment processing.
   */
  const handleCheckout = async () => {
    if (!accountId || cart.length === 0) return

    // Check if this is a demo account
    if (isDemoAccount(accountId)) {
      setError(
        'Cannot checkout with demo accounts. Please use a real Stripe Connect account.'
      )
      return
    }

    setIsCheckingOut(true)
    setError(null)

    try {
      // Prepare line items for checkout
      const lineItems = cart.map(item => {
        const price =
          typeof item.product.default_price === 'object'
            ? item.product.default_price
            : { unit_amount: 0, currency: 'usd' }

        return {
          price_data: {
            unit_amount: price.unit_amount,
            currency: price.currency,
            product_data: {
              name: item.product.name,
              description: item.product.description,
              images: item.product.images,
            },
          },
          quantity: item.quantity,
        }
      })

      // Calculate application fee (example: 5% of total)
      const totalAmount = getCartTotal()
      const applicationFeeAmount = Math.round(totalAmount * 0.05) // 5% fee

      // Create checkout session
      const result = await redirectToConnectCheckout({
        accountId,
        lineItems,
        successUrl: `${window.location.origin}/connect/store/${accountId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/connect/store/${accountId}`,
        applicationFeeAmount,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to create checkout session')
        setIsCheckingOut(false)
      }
      // If successful, user will be redirected to Stripe Checkout
    } catch (error) {
      setError('An unexpected error occurred during checkout')
      console.error('Error during checkout:', error)
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-8">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/connect/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-foreground">
                  Storefront
                </h1>
                <p className="text-xl text-muted-foreground">
                  Browse and purchase products from connected account:{' '}
                  {accountId}
                  {isDemoAccount(accountId) && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      DEMO
                    </Badge>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={loadProducts}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* API Info */}
            <Badge variant="outline">
              <ShoppingCart className="mr-1 h-3 w-3" />
              Connected Account Storefront
            </Badge>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Card className="mb-6 border-destructive/40 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive-foreground">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="mb-6 border-primary/40 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <p className="text-foreground">{success}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Account Warning */}
          {accountId && isDemoAccount(accountId) && (
            <Card className="mb-6 border-muted bg-card/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      Demo Account Detected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This is a demo account. Checkout is disabled. Please
                      create a real Stripe Connect account to test the full
                      functionality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Shopping Cart */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Cart ({getCartItemCount()})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Your cart is empty
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => {
                        const price =
                          typeof item.product.default_price === 'object'
                            ? item.product.default_price
                            : { unit_amount: 0, currency: 'usd' }

                        return (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-medium">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {formatConnectPrice(
                                  price.unit_amount,
                                  price.currency
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                -
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )
                      })}

                      <div className="border-t border-border pt-4">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="font-semibold">Total:</span>
                          <span className="text-lg font-bold text-primary">
                            {formatConnectPrice(getCartTotal())}
                          </span>
                        </div>

                        <Button
                          onClick={handleCheckout}
                          disabled={
                            isCheckingOut ||
                            (accountId && isDemoAccount(accountId))
                          }
                          className="w-full"
                          title={
                            accountId && isDemoAccount(accountId)
                              ? 'Checkout is disabled for demo accounts'
                              : ''
                          }
                        >
                          {isCheckingOut ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : accountId && isDemoAccount(accountId) ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Demo Account
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Checkout
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Products ({filteredProducts.length})
                  </CardTitle>
                  <CardDescription>
                    Browse available products from this connected account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                      <p className="text-muted-foreground">
                        Loading products...
                      </p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="py-8 text-center">
                      <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No products found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? 'Try adjusting your search terms'
                          : 'This store has no products yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.map(product => {
                        const price = product.default_price
                        const amount =
                          typeof price === 'object' ? price.unit_amount : 0
                        const currency =
                          typeof price === 'object' ? price.currency : 'usd'
                        const isInCart = cart.some(
                          item => item.product.id === product.id
                        )

                        return (
                          <Card
                            key={product.id}
                            className="border-border/50 bg-muted/30 transition-shadow hover:shadow-lg"
                          >
                            <CardContent className="p-4">
                              {/* Product Image */}
                              {product.images && product.images.length > 0 ? (
                                <div className="mb-4">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-48 w-full rounded-lg object-cover"
                                    onError={e => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-muted">
                                  <Package className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                              )}

                              {/* Product Info */}
                              <div className="space-y-3">
                                <div>
                                  <h3 className="mb-1 text-lg font-semibold">
                                    {product.name}
                                  </h3>
                                  <p className="line-clamp-3 text-sm text-muted-foreground">
                                    {product.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-primary">
                                    {formatConnectPrice(amount, currency)}
                                  </span>
                                  <Button
                                    onClick={() => addToCart(product)}
                                    disabled={isInCart}
                                    size="sm"
                                  >
                                    {isInCart ? (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        In Cart
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Add to Cart
                                      </>
                                    )}
                                  </Button>
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

          {/* Store Information */}
          <Card className="mt-8 border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ShoppingCart className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    Connected Account Storefront
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    This storefront displays products from a connected Stripe
                    account:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      • Products are fetched using the Stripe-Account header
                    </li>
                    <li>• Checkout uses Direct Charge with application fee</li>
                    <li>• Platform earns revenue through transaction fees</li>
                    <li>
                      • Account ID in URL:{' '}
                      <code className="rounded bg-muted px-1 text-foreground">
                        {accountId}
                      </code>
                      {isDemoAccount(accountId) && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          DEMO
                        </Badge>
                      )}
                    </li>
                    <li>
                      • In production, use a better identifier (subdomain,
                      custom domain)
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

export default ConnectStorefront
