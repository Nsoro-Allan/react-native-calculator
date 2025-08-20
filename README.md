# Calculator App 🧮

A powerful, feature-rich calculator app built with React Native and Expo, offering multiple calculation modes including basic arithmetic, scientific functions, and unit conversions.

## Features ✨

### 🔢 **Basic Calculator**
- Standard arithmetic operations (+, -, ×, ÷, %)
- Decimal point calculations
- Clear and backspace functionality
- Memory functions (MC, MR, M+, M-)

### 🧮 **Scientific Calculator**
- Trigonometric functions (sin, cos, tan)
- Logarithmic functions (ln, log)
- Power and root operations (x², √, xʸ)
- Mathematical constants (π, e)
- Factorial calculations
- Reciprocal (1/x) operations

### 🔄 **Unit Converter**
- **Length**: Meters, centimeters, feet, inches, yards, kilometers
- **Weight**: Kilograms, grams, pounds, ounces, tons
- **Temperature**: Celsius, Fahrenheit, Kelvin
- Real-time conversion as you type
- Easy unit swapping

### 📊 **Additional Features**
- Calculation history with tap-to-reuse
- Haptic feedback for button presses
- Responsive design for all screen sizes
- Smooth animations and transitions
- Dark theme optimized for OLED displays

## Getting Started 🚀

### Prerequisites

Before running this app, you need to have the following installed:

#### 1. **Node.js Installation**
- **Download**: Visit [nodejs.org](https://nodejs.org/) and download the LTS version
- **Windows**: Download the Windows installer (.msi) and run it
- **macOS**: Download the macOS installer (.pkg) or use Homebrew: `brew install node`
- **Linux**: Use your package manager or download from the official site
- **Verify installation**: Run `node --version` and `npm --version` in your terminal

#### 2. **Expo CLI Installation**
After installing Node.js, install Expo CLI globally:
```bash
npm install -g @expo/cli
# or using yarn
yarn global add @expo/cli
```

**Alternative**: You can also use `npx expo` without installing globally.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nsoro-Allan/react-native-calculator.git
   cd react-native-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   # or if you have Expo CLI installed globally
   expo start
   # or using npm/yarn scripts
   npm start
   yarn start
   ```

## Running on Your Device 📱

### Option 1: Using Expo Go (Recommended for testing)

1. **Download Expo Go**
   - **iOS**: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: [Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to the same network**
   - Ensure your phone and computer are on the same Wi-Fi network

3. **Scan the QR code**
   - Run `npm start` in your terminal
   - Open Expo Go on your phone
   - Scan the QR code displayed in your terminal or browser
   - The app will load automatically on your device

### Option 2: Building for Production

#### For Android:
```bash
# Build APK
npm run android

# Or build AAB for Play Store
expo build:android -t app-bundle
```

#### For iOS:
```bash
# Build for iOS (requires macOS and Xcode)
npm run ios

# Or build for App Store
expo build:ios -t archive
```

## Development Commands 🛠️

```bash
# Start development server (recommended)
npx expo start

# Alternative ways to start
npm start
yarn start
expo start  # if installed globally

# Run on Android emulator/device
npm run android
npx expo run:android

# Run on iOS simulator/device (macOS only)
npm run ios
npx expo run:ios

# Run on web browser
npm run web
npx expo start --web

# Clear cache and restart
npx expo start --clear
expo start -c
```

## Project Structure 📁

```
calculator/
├── App.js                 # Main application component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── index.js              # Entry point
├── metro.config.js       # Metro bundler configuration
├── android/              # Android-specific files
├── ios/                  # iOS-specific files
└── node_modules/         # Dependencies
```

## Technologies Used 🔧

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Hooks** - State management and lifecycle
- **Animated API** - Smooth animations and transitions
- **Dimensions API** - Responsive design
- **Vibration API** - Haptic feedback

## App Modes 🎯

### Basic Mode
Perfect for everyday calculations with a clean, simple interface.

### Scientific Mode
Advanced mathematical functions for students, engineers, and professionals.

### Converter Mode
Quick unit conversions for length, weight, temperature, and more.

## Customization 🎨

The app features a modern dark theme optimized for:
- OLED displays for better battery life
- Reduced eye strain in low-light conditions
- Professional appearance
- High contrast for better readability

## Performance Features ⚡

- **Optimized Rendering**: Efficient re-renders using React.memo and useMemo
- **Smooth Animations**: 60fps animations using native driver
- **Responsive Design**: Adapts to different screen sizes automatically
- **Memory Efficient**: Proper cleanup and memory management

## Troubleshooting 🔧

### Common Issues:

1. **Metro bundler issues**
   ```bash
   expo start -c
   ```

2. **Dependencies not installing**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Expo Go not connecting**
   - Ensure both devices are on the same network
   - Try restarting the Expo development server
   - Check firewall settings

4. **Build failures**
   - Update Expo CLI: `npm install -g @expo/cli`
   - Clear cache: `expo start -c`

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the 0BSD License - see the package.json file for details.

## Support 💬

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Include device information and error messages

## Acknowledgments 🙏

- Built with React Native and Expo
- Icons and design inspired by modern calculator interfaces
- Mathematical functions implemented using JavaScript Math library

---

**Enjoy calculating!** 🎉

*Made with ❤️ by Nsoro Allan.*