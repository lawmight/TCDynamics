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
        <div className="max-w-7xl mx-auto">
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
                  Storefront
                </h1>
                <p className="text-xl text-muted-foreground">
                  Browse and purchase products from connected account:{' '}
                  {accountId}
                  {isDemoAccount(accountId) && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      DEMO
                    </span>
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
                    className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* API Info */}
            <Badge variant="outline">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Connected Account Storefront
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

          {/* Demo Account Warning */}
          {accountId && isDemoAccount(accountId) && (
            <Card className="mb-6 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-orange-800 dark:text-orange-400 font-medium">
                      Demo Account Detected
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                      This is a demo account. Checkout is disabled. Please
                      create a real Stripe Connect account to test the full
                      functionality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Shopping Cart */}
            <div className="lg:col-span-1">
              <Card className="bg-card/60 backdrop-blur-sm border-primary/20 sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Cart ({getCartItemCount()})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
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
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
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
                              <span className="text-sm font-medium w-6 text-center">
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

                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center mb-4">
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
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : accountId && isDemoAccount(accountId) ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Demo Account
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
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
              <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Products ({filteredProducts.length})
                  </CardTitle>
                  <CardDescription>
                    Browse available products from this connected account
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
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No products found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? 'Try adjusting your search terms'
                          : 'This store has no products yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            className="bg-muted/30 border-border/50 hover:shadow-lg transition-shadow"
                          >
                            <CardContent className="p-4">
                              {/* Product Image */}
                              {product.images && product.images.length > 0 ? (
                                <div className="mb-4">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={e => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="mb-4 bg-muted rounded-lg h-48 flex items-center justify-center">
                                  <Package className="w-12 h-12 text-muted-foreground/50" />
                                </div>
                              )}

                              {/* Product Info */}
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-3">
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
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        In Cart
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
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
          <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Connected Account Storefront
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                    This storefront displays products from a connected Stripe
                    account:
                  </p>
                  <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                    <li>
                      • Products are fetched using the Stripe-Account header
                    </li>
                    <li>• Checkout uses Direct Charge with application fee</li>
                    <li>• Platform earns revenue through transaction fees</li>
                    <li>
                      • Account ID in URL:{' '}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                        {accountId}
                      </code>
                      {isDemoAccount(accountId) && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          DEMO
                        </span>
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
