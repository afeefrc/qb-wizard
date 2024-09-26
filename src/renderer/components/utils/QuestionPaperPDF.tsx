import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import {
  FilePdfOutlined,
  DownloadOutlined,
  FilePdfTwoTone,
  DownSquareTwoTone,
} from '@ant-design/icons';

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
} from '@react-pdf/renderer';
import logo from '../../../../assets/aai-logo.png';
import RobotoRegular from '../../../../assets/fonts/Roboto-Regular.ttf';
import RobotoBold from '../../../../assets/fonts/Roboto-Bold.ttf';
import RobotoLight from '../../../../assets/fonts/Roboto-Light.ttf';

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
    fontSize: 12,
    marginBottom: 10,
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
    marginBottom: 10,
    flexDirection: 'row',
  },
  questionNumberContainer: {
    marginRight: 5,
  },
  questionNumber: {
    fontSize: 12,
    fontFamily: 'RobotoBold',
    paddingLeft: 15,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 10,
    fontFamily: 'RobotoRegular',
    paddingLeft: 5,
    lineHeight: 1.75,
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
});

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

// Updated PDF content component
function PDFContent({ questionPaper, syllabusSections }) {
  // Group questions by part and syllabus section
  const groupedQuestions = questionPaper.reduce((acc, question) => {
    const section = syllabusSections.find(
      (s) => s.id === question.syllabusSectionId,
    );
    const part = section.questionPart === 1 ? 'A' : 'B';

    if (!acc[part]) acc[part] = {};
    if (!acc[part][section.id])
      acc[part][section.id] = { ...section, questions: [] };

    acc[part][section.id].questions.push(question);
    return acc;
  }, {});

  // Sort sections by serialNumber
  const sortedSections = (part) =>
    Object.values(groupedQuestions[part] || {}).sort(
      (a, b) => a.serialNumber - b.serialNumber,
    );

  let questionNumber = 1; // Initialize question number
  let sectionNumber = 1; // Initialize section number

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Header />
        <Text style={styles.docNumberText}>
          Document No. - AAI/VOBL/ATM/TRG/2024/ADC-0XX
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>SUBJECT</Text>
            </View>
            <View style={[styles.tableCol, { width: '75%' }]}>
              <Text style={styles.tableCell}>
                Aerodrome Control (ADC), Final Examination
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
              <Text style={styles.tableCell}>150</Text>
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
              <Text style={styles.tableCell}>DD.MM.YYYY</Text>
            </View>
          </View>
        </View>

        {/* Add the new content here */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>
              Name & Desig. of the Executive :
            </Text>
            <Text style={styles.signatureText}>Signature : </Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>
              Name & Desig. Of Invigilator :
            </Text>
            <Text style={styles.signatureText}>Signature : </Text>
          </View>
          <Text style={styles.instructionsHeader}>General Instructions:</Text>
          <Text style={styles.instructionsText}>
            Answer all the questions in the booklet/sheets provided to you.
          </Text>
        </View>
        <View style={styles.section}>
          {/* <Text style={styles.mainHeader}>Question Paper</Text> */}
          {['A', 'B'].map((part) => (
            <View key={part}>
              <Text style={styles.partHeader}>Part - {part}</Text>
              {sortedSections(part).map((section) => (
                <View key={section.id}>
                  <View wrap={false}>
                    <Text style={styles.sectionHeader} minPresenceAhead={20}>
                      Section {toRomanNumeral(sectionNumber++)}: (
                      {section.title})
                    </Text>
                  </View>
                  {/* <Text style={styles.sectionName}>{section.name}</Text> */}
                  {section.questions.map((question) => (
                    <View
                      key={questionNumber}
                      style={styles.question}
                      wrap={false}
                    >
                      <View style={styles.questionNumberContainer}>
                        <Text style={styles.questionNumber}>
                          {questionNumber++}.{' '}
                        </Text>
                      </View>
                      <View style={styles.questionTextContainer}>
                        <Text style={styles.questionText}>
                          {question.questionText}
                        </Text>
                        <Text style={styles.marks}>{question.marks} Marks</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
        <Footer />
      </Page>
    </Document>
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

interface QuestionPaperPDFProps {
  questionPaper: any[];
  syllabusSections: any[];
}

function QuestionPaperPDF({
  questionPaper,
  syllabusSections,
}: QuestionPaperPDFProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  return (
    <div>
      <div style={{ margin: '10px 0px' }}>
        <Button
          icon={<FilePdfTwoTone twoToneColor="#eb2f96" />}
          onClick={showModal}
          style={{
            margin: '10px 0px',
            backgroundColor: '#f5f8fe',
            opacity: 0.6,
            padding: '25px 20px',
            borderRadius: '10px',
            border: '0.25px solid #d9d9d9',
            boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          View PDF
        </Button>
        <PDFDownloadLink
          document={
            <PDFContent
              questionPaper={questionPaper}
              syllabusSections={syllabusSections}
            />
          }
          fileName="question_paper.pdf"
        >
          {({ blob, url, loading, error }) => (
            <Button
              icon={<DownSquareTwoTone twoToneColor="#eb2f96" />}
              disabled={loading}
              style={{
                margin: '10px 5px',
                backgroundColor: '#f5f8fe',
                padding: '25px 20px',
                borderRadius: '10px',
                border: '0.25px solid #d9d9d9',
                boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
              }}
            >
              Download PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <Modal
        title="Question Paper PDF"
        visible={isModalVisible}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <PDFViewer style={{ width: '100%', height: '80vh' }}>
          <PDFContent
            questionPaper={questionPaper}
            syllabusSections={syllabusSections}
          />
        </PDFViewer>
      </Modal>
    </div>
  );
}

export default QuestionPaperPDF;
