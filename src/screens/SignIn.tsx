import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { config, currentConfig, styles } from '../constants';
import CustomButton from '../components/Button';
import TextInput from '../components/TextInput';
import Svg, { G, Path } from 'react-native-svg';
import { Box, CheckIcon, NativeBaseProvider, Select } from 'native-base';

import { useCredentials } from '../hooks/useAuth';
import useReviewCredentials from '../hooks/useReviewCredentials';

export const SignInScreen = (): React.JSX.Element => {
  const [credentials, signIn] = useCredentials();
  const reviewCredentials = useReviewCredentials();

  const defaultCredentials = reviewCredentials || currentConfig;
  const [loading, setLoading] = useState(false);
  const [serverURL, setServerURL] = useState(defaultCredentials.serverURL);
  const [userJWTToken, setUserJWTToken] = useState(defaultCredentials.userJWTToken);
  
  useEffect(() => {
    if (reviewCredentials) {
      setServerURL(reviewCredentials.serverURL);
      setUserJWTToken(reviewCredentials.userJWTToken);
    }
  }, [reviewCredentials]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    await signIn({ serverURL, userJWTToken });
    setLoading(false);
  }, [signIn, serverURL, userJWTToken]);

  if (credentials) {
    throw new Error('User is already signed in');
  }

  return (
    <NativeBaseProvider>
      <SafeAreaView style={styles.sectionContainer}>
        <Svg viewBox="0 0 120 121" fill="none" width="100%" height="100" style={{ position: 'absolute', top: 20 }}>
          <G clip-path="url(#clip0_1815_54048)">
            <G clip-path="url(#clip1_1815_54048)">
              <Path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.3252 87.5563C14.9549 87.565 14.589 87.4745 14.2655 87.2942C13.9419 87.1139 13.6725 86.8503 13.4852 86.5307C13.2979 86.2112 13.1995 85.8474 13.2002 85.477C13.2009 85.1066 13.3007 84.7431 13.4892 84.4243L16.8372 78.4243C16.8372 78.4243 16.8372 78.5323 21.9012 69.3643C25.7412 62.8603 29.3412 54.6643 29.3412 45.0643V32.1163C29.3412 18.8563 40.1412 0.196289 61.2732 0.196289C73.1292 0.196289 81.6732 5.58429 86.9412 12.8203C87.0924 12.8155 87.242 12.8529 87.3732 12.9283L98.9412 16.1563C99.4542 16.2953 99.9222 16.5655 100.299 16.9404C100.676 17.3152 100.949 17.7818 101.09 18.294C101.232 18.8063 101.238 19.3467 101.107 19.8619C100.976 20.3771 100.714 20.8494 100.345 21.2323L93.2292 28.4323C93.3372 29.7283 93.4452 30.9043 93.4452 32.2003V45.0403C93.4452 53.9923 96.4692 61.6483 99.8052 67.8403L104.341 77.7643C104.341 77.7643 104.341 77.6563 107.461 84.4483C107.616 84.7723 107.686 85.1305 107.664 85.4891C107.643 85.8477 107.53 86.1948 107.336 86.4975C107.143 86.8003 106.875 87.0487 106.559 87.2193C106.243 87.3898 105.888 87.4769 105.529 87.4723L15.3252 87.5563ZM35.8212 74.5963H38.5092C44.3412 74.5963 81.7092 69.2083 81.7092 34.5883C81.7092 25.4203 74.9172 14.0923 61.2252 14.0923C47.5332 14.0923 40.7292 26.0923 40.7292 34.5883V42.8923C40.7292 49.0363 40.6212 55.5163 37.8252 62.9563C36.7452 65.6443 35.1252 68.9563 33.9372 71.3563C33.7617 71.6877 33.6736 72.0584 33.6811 72.4333C33.6885 72.8082 33.7914 73.1751 33.9799 73.4992C34.1684 73.8234 34.4363 74.0942 34.7585 74.2862C35.0806 74.4781 35.4464 74.5848 35.8212 74.5963Z"
                fill="#6E56CF"
              />
              <Path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M34.6214 100.492C34.3032 100.484 33.988 100.555 33.7045 100.7C33.421 100.844 33.1781 101.058 32.998 101.32C32.8179 101.582 32.7063 101.886 32.6733 102.202C32.6404 102.519 32.6872 102.839 32.8094 103.132V103.252C34.3337 106.602 36.5171 109.61 39.2294 112.096C42.0465 114.694 45.3332 116.73 48.9134 118.096C56.2802 120.897 64.4185 120.897 71.7854 118.096C75.3677 116.728 78.6578 114.692 81.4814 112.096C84.1895 109.606 86.3722 106.599 87.9014 103.252V103.132C88.0269 102.839 88.0762 102.518 88.0447 102.2C88.0132 101.882 87.9019 101.578 87.7212 101.314C87.5404 101.051 87.2961 100.838 87.0108 100.694C86.7255 100.55 86.4086 100.481 86.0894 100.492H77.1374C76.7627 100.504 76.396 100.604 76.0668 100.783C75.7375 100.962 75.4548 101.216 75.2414 101.524C74.5687 102.476 73.7964 103.353 72.9374 104.14C71.2668 105.694 69.3162 106.916 67.1894 107.74C62.8225 109.404 57.9963 109.404 53.6294 107.74C51.5026 106.916 49.5519 105.694 47.8814 104.14C47.0257 103.35 46.2536 102.473 45.5774 101.524C45.3747 101.22 45.1026 100.967 44.7835 100.788C44.4643 100.608 44.1072 100.507 43.7414 100.492H34.6214Z"
                fill="#6E56CF"
              />
            </G>
          </G>
        </Svg>
        <View>
          <Box style={{ padding: 20 }}>
            <Select
              selectedValue={'ux'}
              minWidth="200"
              accessibilityLabel="Choose Configuration"
              placeholder="Choose Configuration"
              _selectedItem={{
                bg: 'teal.600',
                endIcon: <CheckIcon size="5" />,
              }}
              mt={1}
              onValueChange={
                ((itemValue: keyof typeof config) => {
                  const c = config[itemValue];
                  setUserJWTToken(c.userJWTToken);
                  setServerURL(c.serverURL);
                }) as (itemValue: string) => void
              }
            >
              {Object.keys(config).map((key) => {
                return <Select.Item key={key} label={key} value={key} />;
              })}
            </Select>
          </Box>
          <TextInput placeholder="User JWT Token" value={userJWTToken} onChangeText={setUserJWTToken} />
          <TextInput placeholder="Server URL" value={serverURL} onChangeText={setServerURL} />
          <CustomButton title="Sign in" loading={loading} onPress={handleSubmit} />
        </View>
      </SafeAreaView>
    </NativeBaseProvider>
  );
};
