import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface ColumnDataType {
  questionType: string;
  answerList?: string[];
  correctOption?: string;
  trueAnswer?: boolean;
  answerText?: string;
  matchPairs?: { item: string; match: string }[];
}
/* column definitions for an Ant Design Table, typically has a signature :
(text: string, record: ColumnDataType, index: number) => React.ReactNode
*/

export const renderAnswerKey = (
  text: string,
  record: ColumnDataType,
  style = {
    fontSize: '16px',
    fontWeight: 400,
    fontStyle: 'none',
  },
  // index: number,
) => {
  const answerStyle = style;

  switch (record.questionType) {
    case 'mcq':
      if (record.answerList && record.correctOption !== undefined) {
        const correctIndex = parseInt(record.correctOption, 10);
        return (
          <Text style={answerStyle}>
            {String.fromCharCode(65 + correctIndex)}.{' '}
            {record.answerList[correctIndex] || 'N/A'}
          </Text>
        );
      }
      return <Text style={answerStyle}>{text}</Text>;

    case 'trueFalse':
      return (
        <Text style={answerStyle}>
          {record.trueAnswer ? 'True' : `False, ${record.answerText}`}
        </Text>
      );

    case 'matchTheFollowing':
      return (
        <ul style={{ paddingLeft: '0px', margin: 0 }}>
          {record.matchPairs?.map((pair, index) => (
            <li key={index}>
              <Text style={answerStyle}>
                {pair.item} =&gt; {pair.match}
              </Text>
            </li>
          ))}
        </ul>
      );

    case 'fillInTheBlanks':
      return (
        // <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px' }}>
        <>
          {record.answerList?.map((answer, index) => (
            <Text
              key={index}
              style={{
                ...answerStyle,
                padding: '2px',
                borderRadius: '4px',
              }}
            >
              {answer}
              {index < record.answerList.length - 1 && ', '}
            </Text>
          ))}
          {/* </div> */}
        </>
      );

    default:
      return <Text style={answerStyle}>{text}</Text>;
  }
};

export default renderAnswerKey; // TODO: remove this when new functions are added
