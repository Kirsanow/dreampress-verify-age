# Age Estimator

A privacy-focused tool for estimating user age using local facial recognition. All processing happens on the user's device - no data is ever sent to servers.

## Live Demo

Try the age estimator directly: [https://universal-verify.github.io/age-estimator/](https://universal-verify.github.io/age-estimator/)

## Integration Examples

See how to integrate the age estimator into your website: [https://universal-verify.github.io/age-estimator/examples](https://universal-verify.github.io/age-estimator/examples)

## Installation

```bash
npm install age-estimator
```

## Usage

```javascript
import ageEstimator from 'age-estimator';

// Basic usage
ageEstimator.estimateAge({
    livenessCheck: true,
    successCallback: (age) => {
        console.log(`User's estimated age: ${age}`);
    },
    errorCallback: (error) => {
        console.error('Age verification failed:', error);
    }
});
```

### API Reference

#### `estimateAge(params)`

Opens the age estimator in a new tab and returns the estimated age via callback.

##### Parameters

- `params` (Object): Configuration object
  - `livenessCheck` (Boolean): Optional parameter to enable liveness detection
    - When true, performs additional verification to ensure the user is present
    - Helps prevent spoofing attempts using photos
  - `successCallback` (Function): Called when age estimation is successful
    - Receives the estimated age as a number
  - `errorCallback` (Function): Called when age estimation fails
    - Receives the error message as a string

##### Example with all options

```javascript
ageEstimator.estimateAge({
    livenessCheck: true,
    successCallback: (age) => {
        if (age < 18) {
            console.log('User is too young');
        } else {
            console.log('User meets minimum age requirements');
        }
    },
    errorCallback: (error) => {
        console.error('Age verification failed:', error);
    },
});
```

## Privacy

The age estimator processes all data locally on the user's device:

- Video from the user's camera is processed in real-time
- No video or biometric data is ever sent to servers
- If directed from another website, only the estimated age is shared
- All processing happens in the user's browser

## Legal

This age estimator provides a basic level of age verification through facial analysis. While it offers more security than a simple checkbox, it should not be considered a replacement for proper ID validation. For applications requiring verified age confirmation, not just an estimation, we recommend using a comprehensive identity verification solution like [Universal Verify](https://universalverify.com).

The age estimator is provided "as is" without any warranties, express or implied. Users are responsible for ensuring compliance with applicable laws and regulations regarding age verification in their jurisdiction.

## License

MPL-2.0

## Credits

This project uses [face-api.js](https://github.com/justadudewhohacks/face-api.js) for facial detection and age estimation. All processing is done locally on the user's device.