import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Vibration,
  StatusBar,
  Animated,
  Platform,
  Modal,
  FlatList,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isAndroid = Platform.OS === 'android';

const CALCULATOR_MODES = {
  BASIC: 'basic',
  SCIENTIFIC: 'scientific',
  CONVERTER: 'converter',
  PROGRAMMER: 'programmer'
};

const CONVERTER_TYPES = {
  LENGTH: 'length',
  WEIGHT: 'weight',
  TEMPERATURE: 'temperature',
  AREA: 'area',
  VOLUME: 'volume',
  TIME: 'time'
};

const CONVERSIONS = {
  [CONVERTER_TYPES.LENGTH]: {
    name: 'Length',
    icon: '📏',
    units: {
      m: { name: 'Meter', factor: 1 },
      cm: { name: 'Centimeter', factor: 100 },
      mm: { name: 'Millimeter', factor: 1000 },
      km: { name: 'Kilometer', factor: 0.001 },
      ft: { name: 'Feet', factor: 3.28084 },
      inch: { name: 'Inch', factor: 39.3701 },
      yard: { name: 'Yard', factor: 1.09361 }
    }
  },
  [CONVERTER_TYPES.WEIGHT]: {
    name: 'Weight',
    icon: '⚖️',
    units: {
      kg: { name: 'Kilogram', factor: 1 },
      g: { name: 'Gram', factor: 1000 },
      lb: { name: 'Pound', factor: 2.20462 },
      oz: { name: 'Ounce', factor: 35.274 },
      ton: { name: 'Ton', factor: 0.001 }
    }
  },
  [CONVERTER_TYPES.TEMPERATURE]: {
    name: 'Temperature',
    icon: '🌡️',
    units: {
      c: { name: 'Celsius' },
      f: { name: 'Fahrenheit' },
      k: { name: 'Kelvin' }
    }
  }
};

export default function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState(0);
  const [calculatorMode, setCalculatorMode] = useState(CALCULATOR_MODES.BASIC);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [converterType, setConverterType] = useState(CONVERTER_TYPES.LENGTH);
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [expression, setExpression] = useState('');
  const [convertedValue, setConvertedValue] = useState('0');
  
  // Animation values
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [displayScaleAnim] = useState(new Animated.Value(1));
  const scrollRef = useRef(null);
  const displayRef = useRef(null);

  // Responsive dimensions
  const buttonMargin = 6;
  const containerPadding = 16;
  const buttonSize = (screenWidth - (containerPadding * 2) - (buttonMargin * 6)) / 4;
  const smallButtonSize = (screenWidth - (containerPadding * 2) - (buttonMargin * 8)) / 5;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showHistory ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showHistory]);

  useEffect(() => {
    // Animate display changes
    Animated.sequence([
      Animated.timing(displayScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(displayScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [display]);

  const inputNumber = (num) => {
    if (calculatorMode === CALCULATOR_MODES.CONVERTER) {
      convertUnits(num.toString());
      return;
    }

    if (waitingForOperand) {
      setDisplay(String(num));
      setExpression(String(num));
      setWaitingForOperand(false);
    } else {
      const newDisplay = display === '0' ? String(num) : display + num;
      setDisplay(newDisplay);
      setExpression(prev => prev + num);
    }
    Vibration.vibrate(25);
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setExpression('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setExpression(prev => prev + '.');
    }
    Vibration.vibrate(25);
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    Vibration.vibrate(50);
  };

  const clearAll = () => {
    clear();
    setHistory([]);
    setMemory(0);
    Vibration.vibrate(100);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(display + ' ' + nextOperation + ' ');
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(formatNumber(newValue));
      setPreviousValue(newValue);

      const historyEntry = `${formatNumber(currentValue)} ${operation} ${formatNumber(inputValue)} = ${formatNumber(newValue)}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      setExpression(formatNumber(newValue) + ' ' + nextOperation + ' ');
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    Vibration.vibrate(30);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return secondValue !== 0 ? firstValue / secondValue : 0;
      case '%': return firstValue % secondValue;
      case '^': return Math.pow(firstValue, secondValue);
      default: return secondValue;
    }
  };

  const performEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const formattedResult = formatNumber(newValue);

      const historyEntry = `${formatNumber(previousValue)} ${operation} ${formatNumber(inputValue)} = ${formattedResult}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);

      setDisplay(formattedResult);
      setExpression(formattedResult);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
    Vibration.vibrate(50);
  };

  const performScientific = (func) => {
    const inputValue = parseFloat(display);
    let result;

    switch (func) {
      case 'sin': result = Math.sin(inputValue * Math.PI / 180); break;
      case 'cos': result = Math.cos(inputValue * Math.PI / 180); break;
      case 'tan': result = Math.tan(inputValue * Math.PI / 180); break;
      case 'ln': result = Math.log(inputValue); break;
      case 'log': result = Math.log10(inputValue); break;
      case '√': result = Math.sqrt(inputValue); break;
      case 'x²': result = inputValue * inputValue; break;
      case '1/x': result = inputValue !== 0 ? 1 / inputValue : 0; break;
      case '!': result = factorial(inputValue); break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: result = inputValue;
    }

    const formattedResult = formatNumber(result);
    const historyEntry = `${func}(${formatNumber(inputValue)}) = ${formattedResult}`;
    setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);

    setDisplay(formattedResult);
    setExpression(formattedResult);
    setWaitingForOperand(true);
    Vibration.vibrate(30);
  };

  const convertUnits = (value) => {
    const numValue = parseFloat(value) || 0;
    setDisplay(value);

    if (converterType === CONVERTER_TYPES.TEMPERATURE) {
      const result = convertTemperature(numValue);
      setConvertedValue(formatNumber(result));
    } else {
      const conversion = CONVERSIONS[converterType];
      if (conversion) {
        const fromFactor = conversion.units[fromUnit].factor;
        const toFactor = conversion.units[toUnit].factor;
        const result = (numValue / fromFactor) * toFactor;
        setConvertedValue(formatNumber(result));
      }
    }
  };

  const convertTemperature = (value) => {
    let result;
    if (fromUnit === 'c' && toUnit === 'f') {
      result = (value * 9/5) + 32;
    } else if (fromUnit === 'f' && toUnit === 'c') {
      result = (value - 32) * 5/9;
    } else if (fromUnit === 'c' && toUnit === 'k') {
      result = value + 273.15;
    } else if (fromUnit === 'k' && toUnit === 'c') {
      result = value - 273.15;
    } else if (fromUnit === 'f' && toUnit === 'k') {
      result = ((value - 32) * 5/9) + 273.15;
    } else if (fromUnit === 'k' && toUnit === 'f') {
      result = ((value - 273.15) * 9/5) + 32;
    } else {
      result = value;
    }
    return result;
  };

  const factorial = (n) => {
    if (n < 0 || n !== Math.floor(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const backspace = () => {
    if (display.length > 1 && display !== '0') {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setExpression(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression('');
    }
    Vibration.vibrate(25);
  };

  const formatNumber = (num) => {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return '∞';
    
    const str = num.toString();
    if (str.length <= 12) return str;
    
    if (Math.abs(num) >= 1e9) {
      return num.toExponential(6);
    }
    
    return num.toPrecision(10);
  };

  // Memory functions
  const memoryClear = () => {
    setMemory(0);
    Vibration.vibrate(30);
  };

  const memoryRecall = () => {
    setDisplay(formatNumber(memory));
    setExpression(formatNumber(memory));
    setWaitingForOperand(true);
    Vibration.vibrate(30);
  };

  const memoryAdd = () => {
    const value = parseFloat(display);
    setMemory(prevMemory => prevMemory + value);
    Vibration.vibrate(30);
  };

  const memorySubtract = () => {
    const value = parseFloat(display);
    setMemory(prevMemory => prevMemory - value);
    Vibration.vibrate(30);
  };

  const memoryStore = () => {
    const value = parseFloat(display);
    setMemory(value);
    Vibration.vibrate(30);
  };

  const AnimatedButton = ({ onPress, children, style, textStyle, type = 'default', disabled = false }) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [opacityAnim] = useState(new Animated.Value(1));
    
    const handlePressIn = () => {
      if (disabled) return;
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          useNativeDriver: true,
          tension: 400,
          friction: 3,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    };

    const handlePressOut = () => {
      if (disabled) return;
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 400,
          friction: 3,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    };

    return (
      <Animated.View style={[{ 
        transform: [{ scale: scaleAnim }],
        opacity: disabled ? 0.5 : opacityAnim
      }]}>
        <TouchableOpacity
          onPress={disabled ? null : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={disabled ? 1 : 0.8}
          style={[styles.button, style]}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, textStyle]}>{children}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ModeSelector = () => {
    const modes = [
      { key: CALCULATOR_MODES.BASIC, name: 'Basic', icon: '🔢', color: '#4CAF50' },
      { key: CALCULATOR_MODES.SCIENTIFIC, name: 'Scientific', icon: '🧮', color: '#2196F3' },
      { key: CALCULATOR_MODES.CONVERTER, name: 'Converter', icon: '🔄', color: '#FF9800' },
      { key: CALCULATOR_MODES.PROGRAMMER, name: 'Programmer', icon: '💻', color: '#9C27B0' },
    ];

    return (
      <Modal
        visible={showModeSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modeSelector}>
            <Text style={styles.modeSelectorTitle}>Choose Calculator Mode</Text>
            {modes.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.modeOption,
                  { borderLeftColor: mode.color },
                  calculatorMode === mode.key && styles.selectedMode
                ]}
                onPress={() => {
                  setCalculatorMode(mode.key);
                  setShowModeSelector(false);
                  clear();
                }}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <View style={styles.modeTextContainer}>
                  <Text style={styles.modeName}>{mode.name}</Text>
                  <Text style={styles.modeDescription}>
                    {mode.key === CALCULATOR_MODES.BASIC && 'Basic arithmetic operations'}
                    {mode.key === CALCULATOR_MODES.SCIENTIFIC && 'Advanced mathematical functions'}
                    {mode.key === CALCULATOR_MODES.CONVERTER && 'Unit conversions & measurements'}
                    {mode.key === CALCULATOR_MODES.PROGRAMMER && 'Binary, hex, and logical operations'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderConverterButtons = () => {
    const converters = Object.values(CONVERTER_TYPES).map(type => CONVERSIONS[type]).filter(Boolean);
    
    return (
      <View style={styles.converterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.converterTypesScroll}>
          {converters.map((converter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.converterTypeButton,
                converterType === Object.keys(CONVERSIONS)[index] && styles.activeConverterType
              ]}
              onPress={() => setConverterType(Object.keys(CONVERSIONS)[index])}
            >
              <Text style={styles.converterTypeIcon}>{converter.icon}</Text>
              <Text style={styles.converterTypeName}>{converter.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Conversion Display */}
        <View style={styles.conversionDisplay}>
          <Text style={styles.conversionResult}>
            {display} {CONVERSIONS[converterType]?.units[fromUnit]?.name || fromUnit} = {convertedValue} {CONVERSIONS[converterType]?.units[toUnit]?.name || toUnit}
          </Text>
        </View>
        
        <View style={styles.unitSelectors}>
          <View style={styles.unitSelector}>
            <Text style={styles.unitLabel}>From:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.keys(CONVERSIONS[converterType]?.units || {}).map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitButton, fromUnit === unit && styles.activeUnit]}
                  onPress={() => setFromUnit(unit)}
                >
                  <Text style={[styles.unitButtonText, fromUnit === unit && styles.activeUnitText]}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TouchableOpacity 
            style={styles.swapButton}
            onPress={() => {
              setFromUnit(toUnit);
              setToUnit(fromUnit);
            }}
          >
            <Text style={styles.swapButtonText}>⇄</Text>
          </TouchableOpacity>
          
          <View style={styles.unitSelector}>
            <Text style={styles.unitLabel}>To:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.keys(CONVERSIONS[converterType]?.units || {}).map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitButton, toUnit === unit && styles.activeUnit]}
                  onPress={() => setToUnit(unit)}
                >
                  <Text style={[styles.unitButtonText, toUnit === unit && styles.activeUnitText]}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  const getCurrentModeName = () => {
    switch (calculatorMode) {
      case CALCULATOR_MODES.BASIC: return 'Basic';
      case CALCULATOR_MODES.SCIENTIFIC: return 'Scientific';
      case CALCULATOR_MODES.CONVERTER: return 'Converter';
      case CALCULATOR_MODES.PROGRAMMER: return 'Programmer';
      default: return 'Calculator';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowHistory(!showHistory)}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>
            {showHistory ? '✕' : '📊'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setShowModeSelector(true)}
          style={styles.headerTitleButton}
        >
          <Text style={styles.headerTitle}>{getCurrentModeName()}</Text>
          <Text style={styles.headerSubtitle}>▼</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setCalculatorMode(calculatorMode === CALCULATOR_MODES.BASIC ? CALCULATOR_MODES.SCIENTIFIC : CALCULATOR_MODES.BASIC)}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Display Container */}
      <Animated.View style={[styles.displayContainer, { transform: [{ scale: displayScaleAnim }] }]}>
        {/* Expression Display */}
        {expression && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expressionScrollContent}
            ref={scrollRef}
          >
            <Text style={styles.expression} numberOfLines={1}>
              {expression}
            </Text>
          </ScrollView>
        )}
        
        {/* Memory Indicator */}
        {memory !== 0 && (
          <Animated.View style={[styles.memoryIndicator, { opacity: fadeAnim }]}>
            <Text style={styles.memoryText}>M</Text>
            <Text style={styles.memoryValue}>{formatNumber(memory)}</Text>
          </Animated.View>
        )}
        
        {/* Main Display */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.displayScrollContent}
          ref={displayRef}
        >
          <Text style={styles.display} numberOfLines={1}>
            {display}
          </Text>
        </ScrollView>
        
        {/* Operation Indicator */}
        {operation && (
          <View style={styles.operationIndicator}>
            <Text style={styles.operationText}>{operation}</Text>
          </View>
        )}
      </Animated.View>

      {/* History Panel */}
      {showHistory && (
        <Animated.View
          style={[
            styles.historyContainer,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>📜 History</Text>
            <TouchableOpacity onPress={() => setHistory([])}>
              <Text style={styles.clearHistoryText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.historyScroll} showsVerticalScrollIndicator={false}>
            {history.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => {
                  const result = item.split(' = ')[1];
                  if (result && result !== 'Error') {
                    setDisplay(result);
                    setExpression(result);
                    setShowHistory(false);
                  }
                }}
              >
                <Text style={styles.historyItemText} numberOfLines={1}>{item}</Text>
              </TouchableOpacity>
            ))}
            {history.length === 0 && (
              <Text style={styles.historyEmpty}>No calculations yet</Text>
            )}
          </ScrollView>
        </Animated.View>
      )}

      <ScrollView 
        style={styles.buttonsScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.buttonsContainer}
      >
        {/* Converter UI */}
        {calculatorMode === CALCULATOR_MODES.CONVERTER && renderConverterButtons()}

        {/* Scientific Functions */}
        {calculatorMode === CALCULATOR_MODES.SCIENTIFIC && (
          <View style={styles.scientificContainer}>
            <View style={styles.scientificRow}>
              <AnimatedButton onPress={() => performScientific('sin')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>sin</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('cos')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>cos</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('tan')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>tan</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('ln')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>ln</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('log')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>log</AnimatedButton>
            </View>
            <View style={styles.scientificRow}>
              <AnimatedButton onPress={() => performScientific('√')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>√</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('x²')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>x²</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('1/x')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>1/x</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('!')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>x!</AnimatedButton>
              <AnimatedButton onPress={() => performOperation('^')} style={[styles.scientificButton, { width: smallButtonSize }]} textStyle={styles.scientificText}>xʸ</AnimatedButton>
            </View>
            <View style={styles.scientificRow}>
              <AnimatedButton onPress={() => performScientific('π')} style={[styles.constantButton, { width: smallButtonSize }]} textStyle={styles.constantText}>π</AnimatedButton>
              <AnimatedButton onPress={() => performScientific('e')} style={[styles.constantButton, { width: smallButtonSize }]} textStyle={styles.constantText}>e</AnimatedButton>
              <AnimatedButton onPress={memoryClear} style={[styles.memoryButton, { width: smallButtonSize }]} textStyle={styles.memoryButtonText}>MC</AnimatedButton>
              <AnimatedButton onPress={memoryRecall} style={[styles.memoryButton, { width: smallButtonSize }]} textStyle={styles.memoryButtonText}>MR</AnimatedButton>
              <AnimatedButton onPress={memoryAdd} style={[styles.memoryButton, { width: smallButtonSize }]} textStyle={styles.memoryButtonText}>M+</AnimatedButton>
            </View>
          </View>
        )}

        {/* Main Calculator Buttons */}
        <View style={styles.mainButtons}>
          {/* First Row - Controls */}
          <View style={styles.buttonRow}>
            <AnimatedButton
              onPress={clearAll}
              style={[styles.clearButton, { width: buttonSize }]}
              textStyle={styles.clearText}
            >
              AC
            </AnimatedButton>
            <AnimatedButton
              onPress={backspace}
              style={[styles.clearButton, { width: buttonSize }]}
              textStyle={styles.clearText}
            >
              ⌫
            </AnimatedButton>
            <AnimatedButton
              onPress={() => performOperation('%')}
              style={[styles.operatorButton, { width: buttonSize }]}
              textStyle={styles.operatorText}
            >
              %
            </AnimatedButton>
            <AnimatedButton
              onPress={() => performOperation('÷')}
              style={[styles.operatorButton, { width: buttonSize, backgroundColor: operation === '÷' ? '#667eea' : '#4a5568' }]}
              textStyle={styles.operatorText}
            >
              ÷
            </AnimatedButton>
          </View>

          {/* Number Rows */}
          <View style={styles.buttonRow}>
            <AnimatedButton onPress={() => inputNumber(7)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>7</AnimatedButton>
            <AnimatedButton onPress={() => inputNumber(8)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>8</AnimatedButton>
            <AnimatedButton onPress={() => inputNumber(9)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>9</AnimatedButton>
            <AnimatedButton
              onPress={() => performOperation('×')}
              style={[styles.operatorButton, { width: buttonSize, backgroundColor: operation === '×' ? '#667eea' : '#4a5568' }]}
              textStyle={styles.operatorText}
            >
              ×
            </AnimatedButton>
          </View>

          <View style={styles.buttonRow}>
            <AnimatedButton onPress={() => inputNumber(4)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>4</AnimatedButton>
            <AnimatedButton onPress={() => inputNumber(5)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>5</AnimatedButton>
            <AnimatedButton onPress={() => inputNumber(6)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>6</AnimatedButton>
            <AnimatedButton
              onPress={() => performOperation('-')}
              style={[styles.operatorButton, { width: buttonSize, backgroundColor: operation === '-' ? '#667eea' : '#4a5568' }]}
              textStyle={styles.operatorText}
            >
              -
            </AnimatedButton>
          </View>

          <View style={styles.buttonRow}>
            <AnimatedButton onPress={() => inputNumber(1)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>1</AnimatedButton>
            <AnimatedButton onPress={() => inputNumber(2)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>2</AnimatedButton>
            <AnimatedButton onPress={() => inputNumber(3)} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>3</AnimatedButton>
            <AnimatedButton
              onPress={() => performOperation('+')}
              style={[styles.operatorButton, { width: buttonSize, backgroundColor: operation === '+' ? '#667eea' : '#4a5568' }]}
              textStyle={styles.operatorText}
            >
              +
            </AnimatedButton>
          </View>

          {/* Bottom Row - Zero, Decimal, Equals */}
          <View style={styles.buttonRow}>
            <AnimatedButton
              onPress={() => inputNumber(0)}
              style={[styles.numberButton, { width: buttonSize * 2 + buttonMargin }]}
              textStyle={styles.numberText}
            >
              0
            </AnimatedButton>
            <AnimatedButton onPress={inputDecimal} style={[styles.numberButton, { width: buttonSize }]} textStyle={styles.numberText}>.</AnimatedButton>
            <AnimatedButton
              onPress={performEquals}
              style={[styles.equalsButton, { width: buttonSize }]}
              textStyle={styles.equalsText}
            >
              =
            </AnimatedButton>
          </View>
        </View>
      </ScrollView>
      
      <ModeSelector />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: isAndroid ? 20 : 10,
    paddingBottom: 15,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerTitleButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  displayContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 15,
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: isSmallScreen ? 25 : 35,
    marginBottom: 15,
    minHeight: isSmallScreen ? 140 : 160,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  expressionScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minWidth: '100%',
  },
  expression: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '300',
    color: '#888888',
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    marginBottom: 8,
  },
  memoryIndicator: {
    position: 'absolute',
    top: 15,
    left: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 3,
  },
  memoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  memoryValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  displayScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: '100%',
  },
  display: {
    fontSize: isSmallScreen ? 42 : 56,
    fontWeight: '200',
    color: '#FFFFFF',
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'Roboto' }),
    letterSpacing: -1,
  },
  operationIndicator: {
    position: 'absolute',
    top: 15,
    right: 25,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    elevation: 3,
  },
  operationText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    maxHeight: isSmallScreen ? 120 : 150,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearHistoryText: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: '600',
  },
  historyScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  historyItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginVertical: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  historyItemText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  historyEmpty: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  buttonsScrollView: {
    flex: 1,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  converterContainer: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  converterTypesScroll: {
    marginBottom: 15,
  },
  converterTypeButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  activeConverterType: {
    backgroundColor: '#667eea',
  },
  converterTypeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  converterTypeName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  conversionDisplay: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  conversionResult: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  unitSelectors: {
    gap: 10,
  },
  unitSelector: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 15,
  },
  unitLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  unitButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeUnit: {
    backgroundColor: '#667eea',
  },
  unitButtonText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  activeUnitText: {
    color: '#FFFFFF',
  },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: '#ff4757',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  swapButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scientificContainer: {
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  scientificRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mainButtons: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    height: isSmallScreen ? 65 : 75,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  numberButton: {
    backgroundColor: '#2a2a2a',
    height: isSmallScreen ? 65 : 75,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 26 : 30,
    fontWeight: '400',
  },
  operatorButton: {
    backgroundColor: '#4a5568',
    height: isSmallScreen ? 65 : 75,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5a6578',
  },
  operatorText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 30 : 34,
    fontWeight: '400',
  },
  clearButton: {
    backgroundColor: '#ff4757',
    height: isSmallScreen ? 65 : 75,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '600',
  },
  equalsButton: {
    backgroundColor: '#2ed573',
    height: isSmallScreen ? 65 : 75,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equalsText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 30 : 34,
    fontWeight: '600',
  },
  scientificButton: {
    backgroundColor: '#3742fa',
    height: isSmallScreen ? 50 : 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4752ff',
  },
  scientificText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '500',
  },
  constantButton: {
    backgroundColor: '#5f27cd',
    height: isSmallScreen ? 50 : 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c2ed9',
  },
  constantText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
  },
  memoryButton: {
    backgroundColor: '#ff6348',
    height: isSmallScreen ? 50 : 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff7675',
  },
  memoryButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSelector: {
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginHorizontal: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modeSelectorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  selectedMode: {
    backgroundColor: '#333333',
    borderLeftColor: '#2ed573',
  },
  modeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modeDescription: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
  },
});