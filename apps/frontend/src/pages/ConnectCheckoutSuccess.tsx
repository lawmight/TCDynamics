/**
 * Connect Checkout Success Page
 *
 * This page is displayed after a successful checkout from a connected account storefront.
 * It confirms the payment and provides next steps for the customer.
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
import { CheckCircle, ExternalLink, Home, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

const ConnectCheckoutSuccess = () => {
  const { accountId } = useParams<{ accountId: string }>()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [sessionDetails, setSessionDetails] = useState<{
    id: string
    status: string
    amount_total: number
    currency: string
    customer_email: string
    payment_status: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session details on component mount
  useEffect(() => {
    if (sessionId) {
      // In a real application, you would fetch session details from your backend
      // For demo purposes, we'll simulate session data
      setTimeout(() => {
        setSessionDetails({
          id: sessionId,
          status: 'complete',
          amount_total: 7998, // $79.98
          currency: 'usd',
          customer_email: 'customer@example.com',
          payment_status: 'paid',
        })
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase from our connected account store
            </p>
          </div>

          {/* Session Details Card */}
          <Card className="mb-8 bg-card/60 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Order Details
              </CardTitle>
              <CardDescription>
                Your payment has been processed successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading order details...
                  </p>
                </div>
              ) : sessionDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Session ID
                      </p>
                      <p className="font-mono text-sm">{sessionDetails.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        {sessionDetails.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Amount Paid
                      </p>
                      <p className="font-semibold">
                        ${(sessionDetails.amount_total / 100).toFixed(2)}{' '}
                        {sessionDetails.currency.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Status
                      </p>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        {sessionDetails.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Customer Email
                    </p>
                    <p className="font-medium">
                      {sessionDetails.customer_email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No session details available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Check your email
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    You'll receive a confirmation email with your order details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Access your purchase
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    The merchant will contact you with access details or
                    delivery information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Keep your receipt
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Save this page or screenshot for your records
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link to={`/connect/store/${accountId}`}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support Information */}
          <Card className="mt-8 bg-muted/50 border-border/50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about your purchase, please contact
                  the merchant directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/#contact">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/connect/dashboard">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Merchant Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          {accountId && (
            <Card className="mt-8 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <ShoppingBag className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Transaction Details
                    </h3>
                    <p className="text-gray-800 dark:text-gray-200 text-sm mb-3">
                      This purchase was processed through our Stripe Connect
                      integration:
                    </p>
                    <ul className="text-gray-800 dark:text-gray-200 text-sm space-y-1">
                      <li>
                        • Connected Account ID:{' '}
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">
                          {accountId}
                        </code>
                      </li>
                      <li>• Payment processed with Direct Charge</li>
                      <li>• Platform fee collected automatically</li>
                      <li>• Secure payment processing by Stripe</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConnectCheckoutSuccess
