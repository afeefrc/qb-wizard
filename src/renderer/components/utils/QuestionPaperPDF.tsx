import React, { useState } from 'react';
import { Button, Input } from 'antd';
import {
  FilePdfOutlined,
  DownloadOutlined,
  LockOutlined,
} from '@ant-design/icons';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
} from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    // backgroundColor: '#E4E4E4',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  // Add more styles as needed
});

// Updated PDF content component
function PDFContent({ questionPaper, syllabusSections, password }) {
  return (
    <Document
      userPassword={password}
      ownerPassword={password}
      permissions={{
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      }}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Question Paper</Text>
          {/* Add your formatted PDF content here */}
          {questionPaper.map((question, index) => (
            <View key={index} style={styles.section}>
              <Text>Q: {question.questionText}</Text>
              <Text>Ans: {question.answerText}</Text>
              <Text>Marks: {question.marks}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

interface QuestionPaperPDFProps {
  questionPaper: any[];
  syllabusSections: any[];
}

function QuestionPaperPDF({
  questionPaper,
  syllabusSections,
}: QuestionPaperPDFProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [password, setPassword] = useState('');
  console.log(password);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Button
          icon={<FilePdfOutlined />}
          onClick={() => setShowPDF(!showPDF)}
          style={{ marginRight: '10px' }}
        >
          {showPDF ? 'Hide PDF' : 'View PDF'}
        </Button>
        <Input
          type="password"
          placeholder="Set PDF password"
          prefix={<LockOutlined />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '200px', marginRight: '10px' }}
        />
        <PDFDownloadLink
          document={
            <PDFContent
              questionPaper={questionPaper}
              syllabusSections={syllabusSections}
              password={password}
            />
          }
          fileName="question_paper.pdf"
        >
          {({ blob, url, loading, error }) => (
            <Button icon={<DownloadOutlined />} disabled={loading || !password}>
              Download PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {showPDF && (
        <PDFViewer style={{ width: '100%', height: '600px' }}>
          <PDFContent
            questionPaper={questionPaper}
            syllabusSections={syllabusSections}
            password={password}
          />
        </PDFViewer>
      )}
    </div>
  );
}

export default QuestionPaperPDF;
