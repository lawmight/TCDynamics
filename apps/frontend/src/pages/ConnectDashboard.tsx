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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
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
                    className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh Status
                </Button>
              </div>
            </div>

            {/* API Version Info */}
            <Badge variant="outline" className="mb-4">
              <CreditCard className="w-3 h-3 mr-1" />
              Stripe API v2025-09-30.clover
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Create New Account */}
            <div className="lg:col-span-1">
              <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>

                  {/* Account Features Info */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2 text-sm">
                      Account Features:
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
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
              <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Connected Accounts ({accounts.length})
                  </CardTitle>
                  <CardDescription>
                    Manage your connected accounts and their onboarding status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {accounts.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No accounts yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
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
                            className="bg-muted/30 border-border/50"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold">
                                    {account.email}
                                    {isDemoAccount(account.id) && (
                                      <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                        DEMO
                                      </span>
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

                              <div className="grid grid-cols-2 gap-4 mb-4">
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

                              <div className="flex gap-2 flex-wrap">
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
                                    <ExternalLink className="w-4 h-4 mr-2" />
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
                                    <RefreshCw className="w-4 h-4 mr-2" />
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
                                      <Settings className="w-4 h-4 mr-2" />
                                      Manage Products
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleViewStorefront(account.id)
                                      }
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Store className="w-4 h-4 mr-2" />
                                      View Storefront
                                      <ArrowRight className="w-4 h-4 ml-2" />
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
          <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Configuration Required
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                    To use this Stripe Connect integration, make sure you have
                    configured:
                  </p>
                  <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                    <li>
                      •{' '}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                        STRIPE_SECRET_KEY
                      </code>{' '}
                      in your backend environment
                    </li>
                    <li>
                      •{' '}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
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
