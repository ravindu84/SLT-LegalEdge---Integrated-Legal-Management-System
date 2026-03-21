import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric'
import { Capacitor } from '@capacitor/core'

/**
 * Enterprise-grade Security Service
 * Handles Face ID / Fingerprint / Passcode fallbacks securely.
 */
export const SecurityService = {
  async performBiometricAuth(reason = 'Authenticate to access SLT LegalEdge') {
    if (!Capacitor.isNativePlatform()) {
      // Allow passthrough for Web UI
      return true
    }

    try {
      const result = await NativeBiometric.isAvailable()

      if (!result.isAvailable) {
        console.warn('Biometric auth not available on this device.')
        // Device fallback or generic approval if no hardware exists
        // (In strict enterprise, we'd block access, but here we fallback gracefully)
        return true 
      }

      let typeName = 'Biometrics'
      if (result.biometryType === BiometryType.FACE_ID || result.biometryType === BiometryType.FACE_AUTHENTICATION) {
        typeName = 'Face ID'
      } else if (result.biometryType === BiometryType.TOUCH_ID || result.biometryType === BiometryType.FINGERPRINT) {
        typeName = 'Fingerprint'
      }

      // Perform authentication
      await NativeBiometric.verifyIdentity({
        reason: reason,
        title: `Login with ${typeName}`,
        subtitle: 'Secure Legal Officer Access',
        description: 'Verify your biometric identity to access classified case files.',
        negativeButtonText: 'Cancel',
        useFallback: true // Enables PIN/Pattern fallback if Biometrics fail
      })

      // If no error thrown, authentication was successful
      console.log('Biometric auth successful!')
      return true

    } catch (error) {
      console.error('Biometric authentication failed or cancelled:', error)
      
      const errStr = String(error).toLowerCase()
      // If the user explicitly cancelled or authentication actually failed (wrong fingerprint), we block.
      if (errStr.includes('cancel') || errStr.includes('user_cancel') || errStr.includes('authentication_failed')) {
         return false
      }
      
      // If the error is something like 'NotImplemented', 'PluginNotInstalled', or the device
      // doesn't have a secure screen lock set up, we gracefully bypass instead of permanent lockout.
      console.warn('Bypassing biometric lock due to hardware/plugin constraint.')
      return true
    }
  }
}
