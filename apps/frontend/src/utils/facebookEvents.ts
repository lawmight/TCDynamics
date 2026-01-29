import {
  TrackableEventNameEnum,
  type AdditionalEventData,
  type EventData,
  type FacebookPixel,
} from 'react-meta-pixel'

let facebookPixel: FacebookPixel | null = null

export const setFacebookPixelInstance = (instance: FacebookPixel | null) => {
  facebookPixel = instance
}

export const trackFacebookEvent = <K extends TrackableEventNameEnum>(
  eventName: K,
  data?: EventData[K],
  additionalData?: AdditionalEventData
) => {
  if (!facebookPixel) return
  try {
    facebookPixel.trackEvent(eventName, data, additionalData)
  } catch {
    // Ignore pixel errors to avoid blocking UX
  }
}

export const trackDemoClick = () =>
  trackFacebookEvent(TrackableEventNameEnum.Lead)

export const trackContactClick = () =>
  trackFacebookEvent(TrackableEventNameEnum.Contact)

export const trackDemoSubmission = () =>
  trackFacebookEvent(TrackableEventNameEnum.Lead)

export const trackContactSubmission = () =>
  trackFacebookEvent(TrackableEventNameEnum.Contact)
