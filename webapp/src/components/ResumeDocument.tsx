import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { GeneratedResume, ResumeEntry } from '@/lib/api';

// Using built-in Times-Roman PDF fonts — identical to Word's "Times New Roman"
// so output matches the reference template exactly.

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 64,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.38,
    color: '#000',
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  contact: {
    fontSize: 10.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  heading: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 1,
    marginTop: 10,
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  entry: {
    marginBottom: 7,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerLeft: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
  },
  headerRight: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 1,
  },
  subLeft: {
    fontFamily: 'Times-Italic',
    fontSize: 10.5,
  },
  subRight: {
    fontFamily: 'Times-Italic',
    fontSize: 10.5,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 2,
    paddingLeft: 10,
  },
  bulletMark: {
    fontSize: 11,
    marginRight: 6,
    width: 10,
  },
  bulletText: {
    fontSize: 10.5,
    flex: 1,
    textAlign: 'justify',
    lineHeight: 1.38,
  },
  skillsP: {
    fontSize: 10.5,
    marginTop: 3,
    marginBottom: 3,
    textAlign: 'justify',
    lineHeight: 1.4,
  },
  boldInline: {
    fontFamily: 'Times-Bold',
  },
});

function EntryBlock({ e }: { e: ResumeEntry }) {
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLeft}>{e.headerLeft}</Text>
        <Text style={styles.headerRight}>{e.headerRight}</Text>
      </View>
      <View style={styles.subRow}>
        <Text style={styles.subLeft}>{e.subLeft}</Text>
        <Text style={styles.subRight}>{e.subRight}</Text>
      </View>
      {e.bullets.map((b, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletMark}>●</Text>
          <Text style={styles.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionBlock({ title, entries }: { title: string; entries: ResumeEntry[] }) {
  if (!entries || entries.length === 0) return null;
  return (
    <View>
      <Text style={styles.heading}>{title}</Text>
      {entries.map((e, i) => <EntryBlock key={i} e={e} />)}
    </View>
  );
}

export default function ResumeDocument({ data }: { data: GeneratedResume }) {
  const { template, fullName, contact, education, experience, leadership, skills, interests } = data;

  const orderedSections =
    template === 'STUDENT'
      ? [
          <SectionBlock key="edu" title="TA'LIM" entries={education} />,
          <SectionBlock key="exp" title="ISH TAJRIBASI" entries={experience} />,
          <SectionBlock key="lead" title="ETAKCHILIK TAJRIBASI (LEADERSHIP EXPERIENCE)" entries={leadership} />,
        ]
      : [
          <SectionBlock key="exp" title="ISH TAJRIBASI" entries={experience} />,
          <SectionBlock key="lead" title="ETAKCHILIK TAJRIBASI (LEADERSHIP EXPERIENCE)" entries={leadership} />,
          <SectionBlock key="edu" title="TA'LIM" entries={education} />,
        ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{fullName}</Text>
        {contact ? <Text style={styles.contact}>{contact}</Text> : null}

        {orderedSections}

        {(skills || interests) ? (
          <View>
            <Text style={styles.heading}>QIZIQISHLARINGIZ/KO&apos;NIKMALARINGIZ</Text>
            {skills ? (
              <Text style={styles.skillsP}>
                <Text style={styles.boldInline}>Ko&apos;nikmalar: </Text>
                {skills}
              </Text>
            ) : null}
            {interests ? (
              <Text style={styles.skillsP}>
                <Text style={styles.boldInline}>Qiziqishlar: </Text>
                {interests}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
