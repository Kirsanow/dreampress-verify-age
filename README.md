# Age Estimator

A privacy-focused tool for estimating user age using local facial recognition. All processing happens on the user's device - no data is ever sent to any servers.

## Drop-in script

Want to just drop a <script src="..."></script> tag into your html pages to add age gates without worrying about implementation? [Read here](./DROPIN_README.md)

## Integration Examples

See how to integrate the age estimator into your website: [https://universal-verify.github.io/age-estimator/examples](https://universal-verify.github.io/age-estimator/examples)

## Installation

```bash
npm install age-estimator
```

## Usage

```javascript
import ageEstimator from 'age-estimator';

// Basic usage with async/await
try {
    const age = await ageEstimator.estimateAge({ livenessCheck: true });
    console.log('Estimated age:', age);
} catch (error) {
    console.error('Age estimation failed:', error);
}

// Or with .then/.catch
ageEstimator.estimateAge({ livenessCheck: true })
    .then(age => {
        console.log('Estimated age:', age);
    })
    .catch(error => {
        console.error('Age estimation failed:', error);
    });
```

### API Reference

#### `estimateAge(params)`

Opens the age estimator in a new tab and returns a Promise that resolves with the estimated age or rejects on error.

##### Parameters

- `params` (Object): Configuration object
  - `livenessCheck` (Boolean): Optional parameter to enable liveness detection
    - When true, performs additional verification to ensure the user is present
    - Helps prevent spoofing attempts using photos
    - Default: false
  - `enableCache` (Boolean): Optional parameter to enable caching of age estimation results
    - When true, the estimated age will be cached for future use
    - Default: false
  - `cacheDuration` (Number): Optional parameter to determine the number of milliseconds the cached results will be stored for
    - Only used when enableCache is true
    - Default: 24 hours

##### Returns

- `Promise`: Resolves with the estimated age (number) if successful, rejects with an error code if it fails, the tab is closed, the popup is blocked, or a different face was detected during the liveness check.

##### Possible Rejection Error Codes

- `CANCELLED`: The user closed the age estimation tab before completing the process.
- `POPUP_BLOCKED`: The browser blocked the popup window from opening.
- `WEBCAM_ERROR`: There was an issue accessing the user's webcam (e.g., permission denied or device not found).
- `DIFFERENT_FACE_ERROR`: The face detected during liveness check was different from the one used for age estimation.
- `INVALID_SIGNATURE`: The signature of the token generated by the age estimation tool is invalid, possibly due to a spoofing attempt.
- `INTERNAL_ERROR`: An unexpected error occurred during the age estimation process.

#### `clearCache()`

Clears any cached age estimation token.

#### `getCachedAge()`

Retrieves the cached age estimation result if available. Essentially a wrapper function over getCachedToken() and verifyToken(token).

##### Returns

- `Promise`: Resolves with the cached age (number) if found and valid, null otherwise.

#### `getCachedToken()`

Retrieves the raw cached token if available.

##### Returns

- `string`: The cached token if found, null otherwise.

#### `verifyToken(token)`

Verifies the authenticity and validity of an age estimation token.

##### Parameters

- `token` (string): The token to verify

##### Returns

- `Promise`: Resolves with the decoded token data if valid, rejects with an error if invalid or expired.

## Privacy

The age estimator processes all data locally on the user's device:

- Video from the user's camera is processed in real-time
- No video or biometric data is ever sent to any servers
- If directed from another website, only the estimated age is shared
- All processing happens in the user's browser

## Legal

This age estimator provides a basic level of age verification through facial analysis. While it offers more security than a simple checkbox, it should not be considered a replacement for proper ID validation. For applications requiring verified age confirmation, not just an estimation, we recommend using a comprehensive identity verification solution like [Universal Verify](https://universalverify.com).

The age estimator is provided "as is" without any warranties, express or implied. Users are responsible for ensuring compliance with applicable laws and regulations regarding age verification in their jurisdiction.

## License

MPL-2.0

## Credits

This project uses [face-api.js](https://github.com/justadudewhohacks/face-api.js) for facial detection and age estimation. All processing is done locally on the user's device.
