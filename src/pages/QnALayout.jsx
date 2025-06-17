// src/pages/QnALayout.jsx
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import QnA from './QnA';

const QnALayout = () => {
  const { questionId } = useParams();

  return (
    <>
      {/* questionId가 없을 때만 QnA 리스트 보이기 */}
      <div style={{ display: questionId ? 'none' : 'block' }}>
        <QnA />
      </div>

      {/* questionId가 있을 때만 상세 페이지 보이기 */}
      <div style={{ display: questionId ? 'block' : 'none' }}>
        <Outlet />
      </div>
    </>
  );
};

export default QnALayout;
