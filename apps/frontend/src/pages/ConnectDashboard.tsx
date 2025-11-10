/**
 * Connect Dashboard Page
 *
 * This page provides the main interface for managing Stripe Connect accounts.
 * It allows users to:
 * - Create new connected accounts
 * - View account status and onboarding progress
 * - Start the onboarding process
 * - Navigate to product management
 *
 * The page uses the latest Stripe API (2025-09-30.clover) and follows
 * the controller pattern for account management.
 */

import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Plus,
  RefreshCw,
  Settings,
  Store,
  User,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
import {
  createAccountLink,
  createConnectedAccount,
  getConnectedAccount,
  getOnboardingStatus,
  getStatusBadgeColor,
  getStatusDisplayText,
  type ConnectedAccount,
  type CreateAccountParams,
} from '@/utils/stripeConnect'

const ConnectDashboard = () => {
  const navigate = useNavigate()

  // State management
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for creating new account
  const [newAccountEmail, setNewAccountEmail] = useState('')
  const [newAccountCountry, setNewAccountCountry] = useState('US')

  // Sample accounts for demo purposes
  // In production, these would be fetched from your database
  const [demoAccounts] = useState<ConnectedAccount[]>([
    {
      id: 'acct_demo_1',
      email: 'merchant@example.com',
      country: 'US',
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    },
    {
      id: 'acct_demo_2',
      email: 'store@demo.com',
      country: 'FR',
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
    },
  ])

  // Check if account is a demo account
  const isDemoAccount = (accountId: string) => {
    return accountId.startsWith('acct_demo_')
  }

  // Load demo accounts on component mount
  useEffect(() => {
    setAccounts(demoAccounts)
  }, [demoAccounts])

  /**
   * Handle creating a new connected account
   *
   * Creates a Stripe Connect account with controller settings:
   * - Platform controls fee collection (connected account pays fees)
   * - Stripe handles payment disputes and losses
   * - Connected account gets full access to Stripe dashboard
   */
  const handleCreateAccount = async () => {
    if (!newAccountEmail.trim()) {
      setError('Email is required')
      return
    }

    setIsCreatingAccount(true)
    setError(null)
    setSuccess(null)

    try {
      const params: CreateAccountParams = {
        email: newAccountEmail.trim(),
        country: newAccountCountry,
      }

      const result = await createConnectedAccount(params)

      if (result.success && result.accountId) {
        setSuccess(
          `Connected account created successfully! Account ID: ${result.accountId}`
        )
        setNewAccountEmail('')
        setNewAccountCountry('US')

        // Refresh accounts list
        await refreshAccounts()
      } else {
        setError(result.message || 'Failed to create connected account')
      }
    } catch (error) {
      setError('An unexpected error occurred while creating the account')
      console.error('Error creating account:', error)
    } finally {
      setIsCreatingAccount(false)
    }
  }

  /**
   * Handle starting onboarding process for an account
   *
   * Creates an account link and redirects the user to Stripe's onboarding flow.
   * The user will be able to complete their account setup and return to the dashboard.
   */
  const handleStartOnboarding = async (accountId: string) => {
    // Check if this is a demo account
    if (isDemoAccount(accountId)) {
      setError(
        'Cannot start onboarding for demo accounts. Please create a real Stripe Connect account first.'
      )
      return
    }

    try {
      const result = await createAccountLink({
        accountId,
        refreshUrl: `${window.location.origin}/connect/dashboard`,
        returnUrl: `${window.location.origin}/connect/dashboard`,
      })

      if (result.success && result.url) {
        // Redirect to Stripe onboarding
        window.location.href = result.url
      } else {
        setError(result.message || 'Failed to create onboarding link')
      }
    } catch (error) {
      setError('An unexpected error occurred while starting onboarding')
      console.error('Error starting onboarding:', error)
    }
  }

  /**
   * Refresh account status from Stripe API
   *
   * Fetches the latest account details from Stripe to get current
   * onboarding status and capabilities.
   */
  const refreshAccounts = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      // In a real application, you would fetch account IDs from your database
      // and then retrieve their current status from Stripe
      const refreshedAccounts = await Promise.all(
        accounts.map(async account => {
          try {
            const result = await getConnectedAccount(account.id)
            return result.account || account
          } catch (error) {
            console.error(`Error refreshing account ${account.id}:`, error)
            return account // Return original account if refresh fails
          }
        })
      )

      setAccounts(refreshedAccounts)
    } catch (error) {
      setError('Failed to refresh account status')
      console.error('Error refreshing accounts:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  /**
   * Navigate to product management for a specific account
   */
  const handleManageProducts = (accountId: string) => {
    navigate(`/connect/products/${accountId}`)
  }

  /**
   * Navigate to storefront for a specific account
   */
  const handleViewStorefront = (accountId: string) => {
    navigate(`/connect/store/${accountId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-8">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-foreground">
                  Stripe Connect Dashboard
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage connected accounts and their onboarding status
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={refreshAccounts}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh Status
                </Button>
              </div>
            </div>

            {/* API Version Info */}
            <Badge variant="outline" className="mb-4">
              <CreditCard className="mr-1 h-3 w-3" />
              Stripe API v2025-09-30.clover
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

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Create New Account */}
            <div className="lg:col-span-1">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Create New Account
                  </CardTitle>
                  <CardDescription>
                    Create a new Stripe Connect account with controller settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="merchant@example.com"
                      value={newAccountEmail}
                      onChange={e => setNewAccountEmail(e.target.value)}
                      disabled={isCreatingAccount}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="US"
                      value={newAccountCountry}
                      onChange={e =>
                        setNewAccountCountry(e.target.value.toUpperCase())
                      }
                      disabled={isCreatingAccount}
                    />
                  </div>

                  <Button
                    onClick={handleCreateAccount}
                    disabled={isCreatingAccount || !newAccountEmail.trim()}
                    className="w-full"
                  >
                    {isCreatingAccount ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>

                  {/* Account Features Info */}
                  <div className="border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Account Features:
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Platform controls fee collection</li>
                      <li>• Stripe handles disputes & losses</li>
                      <li>• Full dashboard access</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Accounts List */}
            <div className="lg:col-span-2">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Connected Accounts ({accounts.length})
                  </CardTitle>
                  <CardDescription>
                    Manage your connected accounts and their onboarding status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {accounts.length === 0 ? (
                    <div className="py-8 text-center">
                      <User className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No accounts yet
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        Create your first connected account to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {accounts.map(account => {
                        const status = getOnboardingStatus(account)
                        const statusColor = getStatusBadgeColor(status)
                        const statusText = getStatusDisplayText(status)

                        return (
                          <Card
                            key={account.id}
                            className="border-border/50 bg-muted/30"
                          >
                            <CardContent className="p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">
                                    {account.email}
                                    {isDemoAccount(account.id) && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 text-xs"
                                      >
                                        DEMO
                                      </Badge>
                                    )}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Account ID: {account.id}
                                  </p>
                                </div>
                                <Badge className={statusColor}>
                                  {statusText}
                                </Badge>
                              </div>

                              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Country:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {account.country}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Charges:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {account.charges_enabled
                                      ? 'Enabled'
                                      : 'Disabled'}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Payouts:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {account.payouts_enabled
                                      ? 'Enabled'
                                      : 'Disabled'}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Details:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {account.details_submitted
                                      ? 'Submitted'
                                      : 'Pending'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {status === 'incomplete' && (
                                  <Button
                                    onClick={() =>
                                      handleStartOnboarding(account.id)
                                    }
                                    size="sm"
                                    variant="default"
                                    disabled={isDemoAccount(account.id)}
                                    title={
                                      isDemoAccount(account.id)
                                        ? 'Demo accounts cannot be onboarded. Create a real account first.'
                                        : ''
                                    }
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Start Onboarding
                                  </Button>
                                )}

                                {status === 'pending' && (
                                  <Button
                                    onClick={() =>
                                      handleStartOnboarding(account.id)
                                    }
                                    size="sm"
                                    variant="outline"
                                    disabled={isDemoAccount(account.id)}
                                    title={
                                      isDemoAccount(account.id)
                                        ? 'Demo accounts cannot be onboarded. Create a real account first.'
                                        : ''
                                    }
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Continue Onboarding
                                  </Button>
                                )}

                                {status === 'complete' && (
                                  <>
                                    <Button
                                      onClick={() =>
                                        handleManageProducts(account.id)
                                      }
                                      size="sm"
                                      variant="default"
                                    >
                                      <Settings className="mr-2 h-4 w-4" />
                                      Manage Products
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleViewStorefront(account.id)
                                      }
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Store className="mr-2 h-4 w-4" />
                                      View Storefront
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                  </>
                                )}
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

          {/* API Configuration Notice */}
          <Card className="mt-8 border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Settings className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    Configuration Required
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    To use this Stripe Connect integration, make sure you have
                    configured:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      •{' '}
                      <code className="rounded bg-muted px-1 text-foreground">
                        STRIPE_SECRET_KEY
                      </code>{' '}
                      in your backend environment
                    </li>
                    <li>
                      •{' '}
                      <code className="rounded bg-muted px-1 text-foreground">
                        VITE_API_URL
                      </code>{' '}
                      in your frontend environment
                    </li>
                    <li>
                      • Webhook endpoints configured in your Stripe dashboard
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

export default ConnectDashboard
