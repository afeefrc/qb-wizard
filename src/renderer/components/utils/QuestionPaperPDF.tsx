import React, { useCallback, useMemo, useState } from 'react';
import { Button, Modal } from 'antd';
import { FilePdfTwoTone, DownSquareTwoTone } from '@ant-design/icons';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  Image,
  Font,
  Image as PDFImage,
} from '@react-pdf/renderer';
import { renderAnswerKey } from './tableRenderers';
import { unitsFullNames } from '../../SampleData';
import { AppContext } from '../../context/AppContext';
import logo from '../../../../assets/aai-logo.png';
import RobotoRegular from '../../../../assets/fonts/Roboto-Regular.ttf';
import RobotoBold from '../../../../assets/fonts/Roboto-Bold.ttf';
import RobotoLight from '../../../../assets/fonts/Roboto-Light.ttf';
import dayjs from 'dayjs';

// Register fonts
// Font.register({
//   family: 'Roboto',
//   src: 'http://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf',
// });

// Register custom fonts
Font.register({
  family: 'RobotoRegular',
  src: RobotoRegular,
  fontWeight: 'normal',
});

Font.register({
  family: 'RobotoBold',
  src: RobotoBold,
  fontWeight: 'bold',
});

Font.register({
  family: 'RobotoLight',
  src: RobotoLight,
  fontWeight: 'light',
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    // backgroundColor: '#E4E4E4',
    padding: '25px 50px',
    position: 'relative',
    minHeight: '100%',
  },
  pageContent: {
    position: 'relative',
    zIndex: 1,
    flexGrow: 1,
  },
  section: {
    // margin: 10,
    // padding: '0px 20px',
    flexGrow: 1,
    fontSize: 12,
  },
  header: {
    fontSize: 12,
    // marginBottom: 10,
    textAlign: 'center',
  },
  footer: {
    // position: 'absolute',
    fontSize: 10,
    // bottom: 30,
    // left: 0,
    // right: 0,
    // textAlign: 'center',
    color: 'grey',
    // borderTop: '2px solid #000080',
    // paddingTop: 10,
    // marginTop: 5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTop: '2px solid #000080',
    paddingTop: 10,
    marginTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    // marginBottom: 5,
    borderBottom: '2px solid #000080',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 10,
    color: '#000080',
  },
  logo: {
    width: 70,
    height: 40,
  },
  // Add more styles as needed
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    // margin: 'auto',
    margin: 5,
    fontSize: 10,
  },
  docNumberText: {
    fontSize: 10,
    marginBottom: 10,
    fontFamily: 'RobotoRegular',
  },
  mainHeader: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  partHeader: {
    fontSize: 14,
    // marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    textDecoration: 'underline',
  },
  sectionHeader: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15,
    fontFamily: 'RobotoBold',
  },
  sectionName: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  question: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  questionNumberContainer: {
    marginRight: 2,
  },
  questionNumber: {
    fontSize: 12,
    fontFamily: 'RobotoBold',
    paddingLeft: 15,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  subQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    paddingLeft: 15,
  },
  questionText: {
    fontSize: 10,
    fontFamily: 'RobotoRegular',
    paddingLeft: 5,
    paddingRight: 55,
    lineHeight: 2,
  },
  marks: {
    fontSize: 10,
    fontFamily: 'RobotoBold',
    textAlign: 'right',
  },
  signatureSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  signatureLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  signatureLabel: {
    fontSize: 10,
    fontFamily: 'RobotoBold',
  },
  signatureText: {
    fontSize: 10,
    fontFamily: 'RobotoRegular',
    paddingRight: 75,
  },
  instructionsHeader: {
    fontSize: 10,
    fontFamily: 'RobotoBold',
    // marginTop: 5,
    paddingTop: 10,
    marginBottom: 2,
    borderTop: '1px solid #000000',
  },
  instructionsText: {
    fontSize: 10,
    fontFamily: 'RobotoRegular',
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'rotate(-22.5deg)',
    opacity: 0.2,
    zIndex: -1000,
  },
  watermarkText: {
    fontSize: 60,
    color: 'grey',
  },
});

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Water mark
function Watermark({ pdfType, status }) {
  return (
    <View style={styles.watermark}>
      {status !== 'Archived' ? (
        <View style={styles.watermark} fixed>
          <Text style={styles.watermarkText}>DRAFT</Text>
          {pdfType === 'answerKey' && (
            <Text style={styles.watermarkText}>ANSWER KEY</Text>
          )}
        </View>
      ) : (
        pdfType === 'answerKey' && (
          <View style={styles.watermark} fixed>
            <Text style={styles.watermarkText}>ANSWER KEY</Text>
            <Text style={styles.watermarkText}>CONFIDENTIAL</Text>
          </View>
        )
      )}
    </View>
  );
}

// Add these new components
function Header() {
  return (
    <View style={styles.headerContainer} fixed>
      <Text style={styles.headerText}>AIRPORTS AUTHORITY OF INDIA</Text>
      <Image src={logo} style={styles.logo} />
      <Text style={styles.headerText}>ATC TRAINING CELL, KIA, BENGALURU</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footerContainer} fixed>
      <Text
        style={styles.footer}
        fixed
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

function TitleBlock({ metaData }) {
  return (
    <View>
      <Text style={styles.docNumberText}>
        Document No. : {metaData?.documentNo}
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>SUBJECT</Text>
          </View>
          <View style={[styles.tableCol, { width: '75%' }]}>
            <Text style={styles.tableCell}>
              {`${metaData?.unitName}, Final Examination`}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>DURATION</Text>
          </View>
          <View style={[styles.tableCol, { width: '75%' }]}>
            <Text style={styles.tableCell}>Three Hours Thirty Minutes</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Maximum Marks</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{metaData?.totalMarks}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Pass Marks</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>80%</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Date of the Examination</Text>
          </View>
          <View style={[styles.tableCol, { width: '75%' }]}>
            <Text style={styles.tableCell}>{metaData?.examinationDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.signatureSection}>
        <View style={styles.signatureLine}>
          <Text style={styles.signatureLabel}>
            Name & Desig. of the Executive : {metaData?.examinerWithDesignation}
          </Text>
          <Text style={styles.signatureText}>Signature : </Text>
        </View>

        <View style={styles.signatureLine}>
          <Text style={styles.signatureLabel}>
            Name & Desig. Of Invigilator :{' '}
            {metaData?.invigilatorWithDesignation}
          </Text>
          <Text style={styles.signatureText}>Signature : </Text>
        </View>
        <Text style={styles.instructionsHeader}>General Instructions:</Text>

        <Text style={styles.instructionsText}>
          Answer all the questions in the booklet/sheets provided to you.
        </Text>
      </View>
    </View>
  );
}

// Add this helper function at the end of the file
function toRomanNumeral(num: number): string {
  const romanNumerals = [
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
    'XIII',
    'XIV',
    'XV',
    'XVI',
    'XVII',
    'XVIII',
    'XIX',
    'XX',
  ];
  return romanNumerals[num - 1] || num.toString();
}

// New function to convert renderAnswerkey to work with react-pdf
// renderAnswerKey return a react fragment, we need it to be compatible with react-pdf
function renderPDFAnswerKey(text: string, record: ColumnDataType) {
  const answerKeyContent = renderAnswerKey(text, record);

  const renderTextContent = (content: string) => (
    <Text style={styles.answerText}>{content}</Text>
  );

  const renderListContent = (items: React.ReactNode[]) => (
    <View>
      {items.map((item, index) => (
        <Text key={index} style={styles.answerText}>
          • {React.isValidElement(item) ? item.props.children : String(item)}
        </Text>
      ))}
    </View>
  );

  if (React.isValidElement(answerKeyContent)) {
    if (answerKeyContent.type === 'ul') {
      return renderListContent(
        React.Children.toArray(answerKeyContent.props.children),
      );
    } else if (answerKeyContent.type === React.Fragment) {
      return (
        <View>
          {React.Children.map(
            answerKeyContent.props.children,
            (child, index) => (
              <Text key={index} style={styles.answerText}>
                {React.isValidElement(child)
                  ? child.props.children
                  : String(child)}
              </Text>
            ),
          )}
        </View>
      );
    } else {
      return renderTextContent(answerKeyContent.props.children);
    }
  } else if (typeof answerKeyContent === 'string') {
    return renderTextContent(answerKeyContent);
  } else {
    // If it's not a React element or a string, convert it to a string
    return renderTextContent(JSON.stringify(answerKeyContent));
  }
}

// Updated PDF content component
function PDFContent({
  questionPaperBySections,
  // questionPaper,
  // syllabusSections,
  metaData,
  pdfType = 'questionPaper',
}) {
  console.log('metaData', metaData);
  if (
    !questionPaperBySections ||
    Object.keys(questionPaperBySections).length === 0
    // TODO: handle for empty case. i.e. after creatation by trg incharge
  ) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No question paper data available.</Text>
        </Page>
      </Document>
    );
  }

  let questionNumber = 1; // Initialize question number
  let sectionNumber = 1; // Initialize section number

  const getQuestionTypeText = (questionType: string) => {
    switch (questionType) {
      case 'fillInTheBlanks':
        return 'Fill in the blanks:';
      case 'trueFalse':
        return 'True or False:';
      default:
        return '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Watermark pdfType={pdfType} status={metaData?.status} />
        <View style={styles.pageContent}>
          <Header />
          <TitleBlock metaData={metaData} />
          <View style={styles.section}>
            {['Part A', 'Part B'].map((part) => (
              <View key={part}>
                <Text style={styles.partHeader}>{part}</Text>
                {Object.entries(questionPaperBySections[part] || {})
                  .sort(
                    ([, a], [, b]) =>
                      (a?.sectionInfo?.serialNumber || 0) -
                      (b?.sectionInfo?.serialNumber || 0),
                  )
                  .map(([sectionId, sectionData]) => (
                    <View key={sectionId}>
                      <View wrap={false}>
                        <Text
                          style={styles.sectionHeader}
                          minPresenceAhead={20}
                        >
                          Section {toRomanNumeral(sectionNumber++)}: (
                          {sectionData?.sectionInfo?.title ||
                            'Untitled Section'}
                          )
                        </Text>
                      </View>
                      {sectionData?.questions?.map((questionItem, index) => (
                        <View key={index} style={styles.question} wrap={true}>
                          <View style={styles.questionNumberContainer}>
                            <Text style={styles.questionNumber}>
                              {questionNumber++}.{' '}
                            </Text>
                          </View>
                          <View style={styles.questionTextContainer}>
                            {questionItem?.type === 'single' ? (
                              <View style={styles.questionContent}>
                                <View style={styles.questionRow}>
                                  <Text style={styles.questionText}>
                                    {pdfType === 'answerKey' ? (
                                      renderPDFAnswerKey(
                                        questionItem.question?.answerText,
                                        questionItem.question,
                                      )
                                    ) : (
                                      <Text style={styles.questionText}>
                                        {questionItem.question?.questionText ||
                                          'No question text'}
                                      </Text>
                                    )}
                                  </Text>
                                  <Text style={styles.marks}>
                                    {questionItem.question?.marks || 0} Marks
                                  </Text>
                                </View>
                                {questionItem.question?.image && (
                                  <PDFImage
                                    src={blobToDataURL(
                                      questionItem.question.image,
                                    )}
                                    style={styles.questionImage}
                                  />
                                )}
                              </View>
                            ) : (
                              <>
                                <Text style={styles.questionText}>
                                  {getQuestionTypeText(
                                    questionItem?.questionType || '',
                                  )}
                                </Text>
                                {questionItem?.questions?.map(
                                  (subQuestion, subIndex) => (
                                    <View style={styles.questionContent}>
                                      <View
                                        key={subIndex}
                                        style={styles.subQuestionRow}
                                      >
                                        <Text style={styles.questionText}>
                                          <Text style={styles.questionText}>
                                            {String.fromCharCode(97 + subIndex)}
                                            .{'  '}
                                          </Text>
                                          {'  '}
                                          {pdfType === 'answerKey' ? (
                                            renderPDFAnswerKey(
                                              subQuestion?.answerText,
                                              subQuestion,
                                            )
                                          ) : (
                                            <Text style={styles.questionText}>
                                              {subQuestion?.questionText ||
                                                'No question text'}
                                            </Text>
                                          )}
                                        </Text>
                                        <Text style={styles.marks}>
                                          {subQuestion?.marks || 0} Marks
                                        </Text>
                                      </View>
                                      {subQuestion?.image && (
                                        <PDFImage
                                          src={blobToDataURL(subQuestion.image)}
                                          style={styles.questionImage}
                                        />
                                      )}
                                    </View>
                                  ),
                                )}
                              </>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
              </View>
            ))}
          </View>
          <Footer />
        </View>
      </Page>
    </Document>
  );
}

interface QuestionPaperPDFProps {
  // questionPaper: any[];
  // questionPaperBySections: any;
  // syllabusSections: any[];
  downloadButtonDisabled?: boolean;
  examinerAssignmentId?: string;
}

function QuestionPaperPDF({
  // questionPaperBySections,
  // questionPaper,
  // syllabusSections,
  downloadButtonDisabled = false,
  examinerAssignmentId,
}: QuestionPaperPDFProps) {
  const appContext = React.useContext(AppContext);
  const { examinerAssignments, examiners, settings } = appContext || {};
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pdfType, setPdfType] = useState<'questionPaper' | 'answerKey'>(
    'questionPaper',
  );

  const examinerAssignment = examinerAssignments?.find(
    (assignment) => assignment.id === examinerAssignmentId,
  );

  const questionPaperBySections = useMemo(() => {
    return (
      examinerAssignment?.archivedQuestionPaper?.questionPaperBySections || {}
    );
  }, [examinerAssignment?.archivedQuestionPaper?.questionPaperBySections]);

  const syllabusSections =
    examinerAssignment?.archivedQuestionPaper?.syllabusSections || [];

  const calculateTotalMarks = useCallback((sections: any) => {
    return Object.values(sections).reduce(
      (totalSum, part) =>
        totalSum +
        Object.values(part || {}).reduce(
          (partSum, section) =>
            partSum +
            (section?.questions?.reduce(
              (sectionSum, questionItem) =>
                sectionSum +
                (questionItem?.type === 'group'
                  ? questionItem.questions?.reduce(
                      (groupSum, q) => groupSum + (q?.marks || 0),
                      0,
                    ) || 0
                  : questionItem?.question?.marks || 0),
              0,
            ) || 0),
          0,
        ),
      0,
    );
  }, []);

  const totalMarks = useMemo(
    () => calculateTotalMarks(questionPaperBySections),
    [questionPaperBySections, calculateTotalMarks],
  );

  const metaData = {
    unitName:
      unitsFullNames.find((unit) => unit.id === examinerAssignment?.unit)
        ?.label || '',
    examinerWithDesignation:
      examinerAssignment?.archivedQuestionPaper?.examinerWithDesignation ||
      `${
        examiners?.find(
          (examiner) => examiner.id === examinerAssignment?.examiner,
        )?.examinerName || '*** Not assigned ***'
      } ${
        examiners?.find(
          (examiner) => examiner.id === examinerAssignment?.examiner,
        )?.examinerDesignation || ''
      }`.trim(),
    invigilatorWithDesignation:
      examinerAssignment?.archivedQuestionPaper?.invigilatorWithDesignation ||
      `${
        examiners?.find(
          (examiner) =>
            examiner.id === examinerAssignment?.examiner_invigilator,
        )?.examinerName || '*** Not assigned ***'
      } ${
        examiners?.find(
          (examiner) =>
            examiner.id === examinerAssignment?.examiner_invigilator,
        )?.examinerDesignation || ''
      }`.trim(),
    totalMarks,
    examinationDate: (() => {
      const date = examinerAssignment?.archivedQuestionPaper?.examinationDate;
      if (date) {
        // Try to parse the date with dayjs
        const parsedDate = dayjs(date);

        // Check if the parsed date is valid
        if (parsedDate.isValid()) {
          return parsedDate.format('DD/MM/YYYY');
        }
      }
      return '*** Not assigned ***';
    })(),
    documentNo:
      (() => {
        const stationCode = settings?.stationCode || '****';
        const year = examinerAssignment?.archivedQuestionPaper?.year || '****';
        const unit = examinerAssignment?.unit || '****';
        const serialNumber =
          examinerAssignment?.archivedQuestionPaper?.serialNumber;
        const formattedSerialNumber = serialNumber
          ? serialNumber.toString().padStart(3, '0')
          : '***';

        return `AAI/${stationCode}/ATM/TRG/${year}/${unit}-${formattedSerialNumber}`;
      })() || '** Not assigned **',
    status: examinerAssignment?.status,
  };

  const showModal = (type: 'questionPaper' | 'answerKey') => {
    setPdfType(type);
    setIsModalVisible(true);
  };
  const handleCancel = () => setIsModalVisible(false);

  const getFileName = useCallback(() => {
    const unitName = examinerAssignment?.unit
      .replace(/\s+/g, '_')
      .toLowerCase();
    let examDate = 'DD-MM-YYYY';
    try {
      if (examinerAssignment?.archivedQuestionPaper?.examinationDate) {
        examDate = new Date(
          examinerAssignment.archivedQuestionPaper.examinationDate,
        )
          .toLocaleDateString('en-IN')
          .replace(/\//g, '-');
      }
    } catch (error) {
      console.error('Error parsing examination date:', error);
    }
    return `${unitName}_final_exam_${examDate}${
      pdfType === 'answerKey' ? '_answer_key' : ''
    }.pdf`;
  }, [
    examinerAssignment?.unit,
    examinerAssignment?.archivedQuestionPaper?.examinationDate,
    pdfType,
  ]);

  return (
    <div>
      <div style={{ margin: '10px 0px' }}>
        <Button
          icon={<FilePdfTwoTone twoToneColor="#eb2f96" />}
          onClick={() => showModal('questionPaper')}
          style={{
            margin: '10px 0px',
            backgroundColor: '#f5f8fe',
            opacity: 0.6,
            padding: '20px 15px',
            borderRadius: '10px',
            border: '0.25px solid #d9d9d9',
            boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          View PDF
        </Button>
        <Button
          icon={<FilePdfTwoTone twoToneColor="#eb2f96" />}
          onClick={() => showModal('answerKey')}
          style={{
            margin: '10px 0px 10px 10px',
            backgroundColor: '#f5f8fe',
            opacity: 0.6,
            padding: '20px 15px',
            borderRadius: '10px',
            border: '0.25px solid #d9d9d9',
            boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          Answer Key
        </Button>
        {!downloadButtonDisabled && (
          <PDFDownloadLink
            document={
              <PDFContent
                questionPaperBySections={questionPaperBySections}
                // questionPaper={questionPaper}
                // syllabusSections={syllabusSections}
                metaData={metaData}
                pdfType={pdfType}
              />
            }
            fileName={getFileName()}
          >
            {({ blob, url, loading, error }) => (
              <Button
                icon={<DownSquareTwoTone twoToneColor="#eb2f96" />}
                disabled={loading}
                style={{
                  margin: '10px 0px',
                  backgroundColor: '#f5f8fe',
                  opacity: 0.6,
                  padding: '20px 15px',
                  borderRadius: '10px',
                  border: '0.25px solid #d9d9d9',
                  boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                }}
              >
                Download PDF
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      <Modal
        title={
          pdfType === 'questionPaper' ? 'Question Paper PDF' : 'Answer Key PDF'
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <PDFViewer
          style={{ width: '100%', height: '80vh' }}
          showToolbar={!downloadButtonDisabled}
        >
          <PDFContent
            // questionPaper={questionPaper}
            questionPaperBySections={questionPaperBySections}
            // syllabusSections={syllabusSections}
            metaData={metaData}
            pdfType={pdfType}
          />
        </PDFViewer>
      </Modal>
    </div>
  );
}

export default QuestionPaperPDF;
