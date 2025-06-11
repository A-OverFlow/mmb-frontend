// src/components/icons/SurveyCorpsIcon.jsx
import React from 'react';
import RawSvg from '@/assets/icons/SurveyCorps.svg?react';    // ← ?react 추가
import { SvgIcon } from '@mui/material';

export default function SurveyCorpsIcon(props) {
  return (
    <SvgIcon
      {...props}
      inheritViewBox
      component={RawSvg}
    />
  );
}
