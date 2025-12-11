"use client";

import PageContainer from "@/components/common/PageContainer";
import Footer from "@/components/navbar/Footer";
import Navbar from "@/components/navbar/Navbar";
import { CssBaseline, Grid, Typography } from "@mui/material";

export default function GDPRPage() {
  return (
    <Grid
      width="100vw"
      height="100vh"
      container
      flexDirection="column"
      position="relative"
      zIndex={10}
    >
      <CssBaseline />
      <Navbar elevated={false} />
      <Grid
        container
        flexDirection="column"
        sx={{ overflowY: "auto" }}
        flex="1"
        gap={16}
      >
        <PageContainer>
          <Grid
            container
            flexDirection="column"
            alignItems="flex-start"
            paddingBottom={8}
            paddingTop={4}
            spacing={2}
          >
            <Typography variant="h4" bgcolor="white" textAlign="justify">
              Datenschutzerklärung und allgemeine Informationen zur Umsetzung
              der datenschutzrechtlichen Vorgaben der Artikel 12 bis 14 der
              Datenschutz-Grundverordnung in der VR-Visualisierungsplattform des
              Landesbetriebs Geoinformation und Vermessung der Freien und
              Hansestadt Hamburg
            </Typography>
            <Typography>
              Fast jede natürliche Person sowie Unternehmen treten mit der
              Verwaltung (einschließlich Landesbetriebe) früher oder später in
              Kontakt. Hierbei müssen personenbezogene Daten verarbeitet werden.
              Daten sind personenbezogen, wenn sie einer natürlichen Person
              (einem Menschen) zugeordnet werden können. Wenn
              Verwaltungsbehörden oder Landesbetriebe personenbezogene Daten
              verarbeiten, bedeutet dies, dass sie diese Daten z.B. erheben,
              speichern, verwenden, übermitteln, zum Abruf bereitstellen oder
              löschen. Personenbezogene Daten werden grundsätzlich nur für den
              Zweck verarbeitet, für den sie erhoben wurden. Eine zweckändernde
              Verarbeitung erfolgt nur, wenn dies gesetzlich erlaubt ist oder
              Sie eingewilligt haben. Als Betreiber dieses Online-Dienstes
              nehmen wir den Schutz Ihrer persönlichen Daten sehr ernst. Wir
              behandeln Ihre personenbezogenen Daten vertraulich und
              entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
              Datenschutzerklärung.
            </Typography>
            <Typography>
              Im Folgenden informieren wir Sie darüber, welche personenbezogenen
              Daten wir für diesen Online-Dienst erheben, bei wem wir sie
              erheben und was wir mit diesen Daten machen. Außerdem informieren
              wir Sie über Ihre Rechte in Datenschutzfragen und an wen Sie sich
              diesbezüglich wenden können.
            </Typography>
            <Typography variant="h6">
              1. Wer sind wir und auf welcher Rechtsgrundlage verarbeiten wir
              Daten?
            </Typography>
            <Typography>
              Wir sind der Landesbetrieb Geoinformation und Vermessung (LGV) der
              Freien und Hansestadt Hamburg. Zu unseren Kernaufgaben zählen
            </Typography>
            <ul>
              <li>die Sicherstellung eines einheitlichen Raumbezuges</li>
              <li>der Nachweis des Eigentums an Grund und Boden</li>
              <li>der Nachweis der Geotopografie Hamburgs</li>
              <li>
                die Durchführung von Vermessungsarbeiten für kommunale
                Auftraggeber
              </li>
              <li>
                der Aufbau der Geodateninfrastruktur in Hamburg und der
                Metropolregion
              </li>
              <li>
                die Bewertung von Grundstücken innerhalb der Freien und
                Hansestadt Hamburg.
              </li>
            </ul>
            <Typography>
              Maßgebliche Rechtsgrundlagen der Arbeit des LGV sind unter anderem
              das Hamburgische Vermessungsgesetz, das Hamburgische
              Geodateninfrastrukturgesetz sowie §§ 192 ff. Baugesetzbuch. Ferner
              agiert der LGV als zukunftsgestaltender und innovativer
              Dienstleister für öffentliche und private Akteure im Bereich der
              Vermessung, der Geoinformation und im Angebot moderner Werbe- und
              Softwareanwendungen. Zum Angebotsportfolio des LGV gehören
              IT-basierte urbane (Geo-)Anwendungen genauso wie 3D-Darstellungen
              und Datenanalysen wie zum Beispiel diese
              VR-Visualisierungsplattform.
            </Typography>
            <Typography>
              Wir verarbeiten Daten generell auf der Grundlage folgender
              Regelungen:
            </Typography>
            <Typography>
              Sofern Sie in die Datenverarbeitung eingewilligt haben,
              verarbeiten wir Ihre personenbezogenen Daten auf Grundlage von
              Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a DSGVO, sofern
              besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO verarbeitet
              werden. Im Falle einer ausdrücklichen Einwilligung in die
              Übertragung personenbezogener Daten in Drittstaaten erfolgt die
              Datenverarbeitung außerdem auf Grundlage von Art. 49 Abs. 1 lit. a
              DSGVO. Sofern Sie in die Speicherung von Cookies oder in den
              Zugriff auf Informationen in Ihr Endgerät (z. B. via
              Device-Fingerprinting) eingewilligt haben, erfolgt die
              Datenverarbeitung zusätzlich auf Grundlage von § 25 Abs. 1 TDDDG.
              Die Einwilligung ist jederzeit widerrufbar. Sind Ihre Daten zur
              Vertragserfüllung oder zur Durchführung vorvertraglicher Maßnahmen
              erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6
              Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten,
              sofern diese zur Erfüllung einer rechtlichen Verpflichtung (Art. 6
              Abs. 1 lit. c DSGVO) oder zur Wahrnehmung einer uns übertragenen
              Aufgabe des öffentlichen Interesses (z.B. Geoinformationsdienst)
              nach Art. 6 Abs. 1 lit. e DSGVO erforderlich sind. Die
              Datenverarbeitung kann ferner auf Grundlage unseres berechtigten
              Interesses nach Art. 6 Abs. 1 lit. f DSGVO erfolgen. Über die
              jeweils im Einzelfall einschlägigen Rechtsgrundlagen wird in den
              folgenden Absätzen dieser Datenschutzerklärung informiert.
            </Typography>
            <Typography variant="h6">
              2. Wer sind Ihre Ansprechpersonen?
            </Typography>
            <Typography>
              Gemäß Art. 4 Nr. 7 DSGVO ist Verantwortlicher die natürliche oder
              juristische Person, Behörde, Einrichtung oder andere Stelle, die
              allein oder gemeinsam mit anderen über die Zwecke und Mittel der
              Verarbeitung von personenbezogenen Daten entscheidet. Die
              Datenverarbeitung bei diesem Online-Dienst erfolgt durch den LGV
              als Betreiber, den Sie bei Fragen kontaktieren können.
            </Typography>
            <Typography sx={{ textDecoration: "underline" }}>
              Verantwortliche Stelle:
            </Typography>
            <Typography>
              Freie und Hansestadt Hamburg
              <br />
              Landesbetrieb Geoinformation und Vermessung (LGV)
              <br />
              Fachbereich 3D-Stadtmodell
              <br />
              Neuenfelder Straße 19
              <br />
              21109 Hamburg
              <br />
              E-Mail: 3D-info@gv.hamburg.de
              <br />
            </Typography>
            <Typography>
              Fragen in datenschutzrechtlichen Angelegenheiten können Sie an den
              oder die zuständige(n) Datenschutzbeauftragte(n) richten:
            </Typography>
            <Typography>
              Datenschutzbeauftragte(r) der Behörde für Stadtentwicklung und
              Wohnen
              <br />
              Neuenfelder Straße 19
              <br />
              21109 Hamburg
              <br />
              Tel.: +49 40 42840 2489
              <br />
              E-Mail: datenschutz@bsw.hamburg.de
              <br />
            </Typography>
            <Typography variant="h6">
              3. Zu welchem Zweck verarbeiten wir Ihre personenbezogenen Daten?
            </Typography>
            <Typography>
              Der Zweck der Datenverarbeitung in Verfahren der öffentlichen
              Verwaltung einschließlich der Landesbetriebe ist es, die
              zugewiesenen öffentlichen Aufgaben hinreichend erfüllen, Ihr(e)
              Anliegen inhaltlich bearbeiten und die Anwendung (z.B.
              VR-Visualisierungsplattform) fehlerfrei bereitstellen zu können.
              Im vorliegenden Fall verarbeiten wir personenbezogene Daten, um
              Ihre Registrierung zu ermöglichen, Ihre nutzergebundenen Projekte
              vorzuhalten, Ihre 3D-Modelle entgegenzunehmen und diese in der
              Visualisierungsumgebung anzuzeigen.{" "}
            </Typography>
            <Typography variant="h6">
              4. Welche personenbezogenen Daten verarbeiten wir?{" "}
            </Typography>
            <Typography>
              Personenbezogene Daten sind Daten, mit denen Sie persönlich
              identifiziert werden können. Wir verarbeiten insbesondere folgende
              projektbezogene, ggf. in Teilen personenbezogene Daten: 3D-Modell,
              Daten zum Projektkontext (Name des Projektes und Nutzerkonten, die
              Zugriff auf das Projekt erhalten haben) sowie Metadaten
              (Erstelldatum, Dateiformat, Größe).
            </Typography>
            <Typography variant="h6">
              5. Wie verarbeiten wir diese Daten und geben wir diese weiter?
            </Typography>
            <Typography>
              In Verwaltungsverfahren beziehungsweise in den Verfahren zum
              Betrieb dieses Online-Dienstes werden Ihre personenbezogenen Daten
              gespeichert, für die genannten Zwecke verwendet und bei Bedarf
              automatisiert mit geeigneten Mitteln der Informationstechnik
              verarbeitet. Wir setzen dabei technische und organisatorische
              Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten gegen
              unbeabsichtigte oder unrechtmäßige Vernichtung, Verlust oder
              Veränderung sowie gegen unbefugte Offenlegung oder unbefugten
              Zugang zu schützen. Unsere Sicherheitsstandards entsprechen stets
              den aktuellsten technologischen Entwicklungen.
            </Typography>
            <Typography>
              Im Rahmen unserer Geschäftstätigkeit als Landesbetrieb der Freien
              und Hansestadt Hamburg arbeiten wir auch mit externen Stellen
              zusammen. Dabei ist teilweise eine Übermittlung von
              personenbezogenen Daten an diese externen Stellen erforderlich.
              Wir geben personenbezogene Daten nur dann an externe Stellen
              weiter, wenn dies im Rahmen einer Vertragserfüllung erforderlich
              ist, wenn wir gesetzlich hierzu verpflichtet sind (z. B.
              Weitergabe von Daten an Steuerbehörden), wenn wir ein berechtigtes
              Interesse nach Art. 6 Abs. 1 lit. f DSGVO an der Weitergabe haben
              oder wenn eine sonstige Rechtsgrundlage die Datenweitergabe
              erlaubt. Beim Einsatz von Auftragsverarbeitern geben wir
              personenbezogene Daten unserer Kunden nur auf Grundlage eines
              gültigen Vertrags über Auftragsverarbeitung weiter. Im Falle einer
              gemeinsamen Verarbeitung wird ein Vertrag über gemeinsame
              Verarbeitung geschlossen.
            </Typography>
            <Typography>
              Im Rahmen des hier einschlägigen Verfahrens geben wir, wenn dies
              erforderlich ist, Daten an die folgenden Empfänger weiter:
            </Typography>
            <ul>
              <li>
                Microsoft Ireland Operations Limited (als Anbieter der
                Cloud-Infrastruktur „Microsoft Azure“) zur Verarbeitung
                ausschließlich in Rechenzentren innerhalb der Europäischen
                Union)
              </li>
              <li>
                Beauftragte IT-Dienstleister im Rahmen von Wartungs-, Betriebs-
                und Supportleistungen (sofern ein entsprechender
                Auftragsverarbeitungsvertrag besteht)
              </li>
            </ul>
            <Typography variant="h6">
              6. Wie lange speichern wir Ihre Daten?{" "}
            </Typography>
            <Typography>
              In Verfahren der öffentlichen Verwaltung einschließlich der
              Landesbetriebe werden Daten grundsätzlich für die Dauer der
              Bearbeitung gespeichert. Nach Abschluss dieser Verfahren werden
              Daten so lange gespeichert, wie es nach den geltenden
              Bestimmungen, insbesondere den gesetzlichen Aufbewahrungsfristen
              und der Akten- und Geschäftsordnung vorgeschrieben ist. Darüber
              hinaus werden nutzungsbezogene Daten nur solange gespeichert, wie
              der/die Nutzer:in den entsprechenden Dienst aktiv verwendet. Bei
              längerer Inaktivität werden die Daten gemäß den internen Lösch-
              und Aufbewahrungsfristen automatisiert gelöscht.
            </Typography>
            <Typography variant="h6">
              7. Welche Rechte (Auskunftsrecht, Widerspruchsrecht usw.) haben
              Sie?{" "}
            </Typography>
            <Typography>
              Sie haben nach der DSGVO verschiedene Rechte. Einzelheiten ergeben
              sich insbesondere aus Artikel 15 bis 18 und 21 der DSGVO. Diese
              Rechte können Sie gegenüber der verantwortlichen Stelle (s. Ziff.
              2) geltend machen.
            </Typography>
            <ul>
              <li>Recht auf Auskunft</li>
            </ul>
            <Typography>
              Sie können jederzeit unentgeltlich Auskunft über Ihre durch uns
              verarbeiteten personenbezogenen Daten sowie über Herkunft,
              Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten
              verlangen. Bitte beschreiben Sie in Ihrem Auskunftsantrag Ihr
              Anliegen möglichst genau, um das Zusammenstellen der
              erforderlichen Daten zu erleichtern.{" "}
            </Typography>
            <ul>
              <li>Recht auf Berichtigung </li>
            </ul>
            <Typography>
              Wenn Ihre Angaben nicht (mehr) zutreffend sind, können Sie eine
              Berichtigung verlangen. Wenn Ihre Daten unvollständig sind, können
              Sie eine Vervollständigung verlangen. Hierzu sowie zu weiteren
              Fragen zum Thema können Sie sich jederzeit an uns wenden.
            </Typography>
            <ul>
              <li>Recht auf Löschung</li>
            </ul>
            <Typography>
              Sie können grundsätzlich die Löschung Ihrer personenbezogenen
              Daten verlangen. Für die Bearbeitung bestimmter Anliegen ist es in
              Verwaltungsverfahren zwingend notwendig, Ihre Daten zu
              verarbeiten. Dies geschieht dann auf gesetzlicher Grundlage. Wir
              weisen darauf hin, dass in diesem Fall eine Löschung nicht immer
              oder nicht vollständig möglich sein kann.
            </Typography>
            <ul>
              <li>Recht auf Datenübertragbarkeit </li>
            </ul>
            <Typography>
              Sie haben das Recht, Daten, die wir auf Grundlage Ihrer
              Einwilligung oder in Erfüllung eines Vertrags automatisiert
              verarbeiten, an sich oder an einen Dritten in einem gängigen,
              maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die
              direkte Übertragung der Daten an einen anderen Verantwortlichen
              verlangen, erfolgt dies nur, soweit es technisch machbar ist.
            </Typography>
            <ul>
              <li>Recht auf Widerruf der Einwilligung zur Datenverarbeitung</li>
            </ul>
            <Typography>
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen
              Einwilligung möglich. Wenn Sie eine Einwilligung zur
              Datenverarbeitung erteilt haben, können Sie diese Einwilligung
              jederzeit für die Zukunft widerrufen. Die Rechtmäßigkeit der bis
              zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
              unberührt.
            </Typography>
            <ul>
              <li>Recht auf Einschränkung der Verarbeitung</li>
            </ul>
            <Typography>
              Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer
              personenbezogenen Daten zu verlangen. Hierzu können Sie sich
              jederzeit an uns wenden. Das Recht auf Einschränkung der
              Verarbeitung besteht in folgenden Fällen:{" "}
            </Typography>
            <ul>
              <li>
                Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer
                personenbezogenen Daten zu verlangen. Hierzu können Sie sich
                jederzeit an uns wenden. Das Recht auf Einschränkung der
                Verarbeitung besteht in folgenden Fällen:{" "}
              </li>
              <li>
                Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig
                geschah oder geschieht, können Sie statt der Löschung die
                Einschränkung der Datenverarbeitung verlangen.
              </li>
              <li>
                Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie
                sie jedoch zur Ausübung, Verteidigung oder Geltendmachung von
                Rechtsansprüchen benötigen, haben Sie das Recht, statt der
                Löschung die Einschränkung der Verarbeitung Ihrer
                personenbezogenen Daten zu verlangen.
              </li>
              <li>
                Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt
                haben, muss eine Abwägung zwischen Ihren und unseren Interessen
                vorgenommen werden. Solange noch nicht feststeht, wessen
                Interessen überwiegen, haben Sie das Recht, die Einschränkung
                der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
              </li>
            </ul>
            <Typography>
              Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten
              eingeschränkt haben, dürfen diese Daten – von ihrer Speicherung
              abgesehen – nur mit Ihrer Einwilligung oder zur Geltendmachung,
              Ausübung oder Verteidigung von Rechtsansprüchen oder zum Schutz
              der Rechte einer anderen natürlichen oder juristischen Person oder
              aus Gründen eines wichtigen öffentlichen Interesses der
              Europäischen Union oder eines Mitgliedstaats verarbeitet werden.
            </Typography>
            <ul>
              <li>Recht auf Widerspruch </li>
            </ul>
            <Typography>
              Sie haben das Recht, der Verarbeitung Ihrer Daten zu
              widersprechen. Bitte beachten Sie, dass ein Widerspruch nur
              zukünftige Verarbeitungen verhindert.
            </Typography>
            <Typography>
              Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e
              oder f DSGVO erfolgt, haben Sie jederzeit das Recht, aus Gründen,
              die sich aus Ihrer besonderen Situation ergeben, gegen die
              Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen;
              dies gilt auch für ein auf diese Bestimmungen gestütztes
              Profiling. Die jeweilige Rechtsgrundlage, auf denen eine
              Verarbeitung beruht, entnehmen Sie dieser Datenschutzerklärung.
              Wenn Sie Widerspruch einlegen, werden wir Ihre betroffenen
              personenbezogenen Daten nicht mehr verarbeiten, es sei denn, wir
              können zwingende schutzwürdige Gründe für die Verarbeitung
              nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen
              oder die Verarbeitung dient der Geltendmachung, Ausübung oder
              Verteidigung von Rechtsansprüchen (Widerspruch nach Art. 21 Abs. 1
              DSGVO).{" "}
            </Typography>
            <ul>
              <li>Recht auf Beschwerde </li>
            </ul>
            <Typography>
              Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein
              Beschwerderecht bei einer Aufsichtsbehörde, insbesondere in dem
              Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes
              oder des Orts des mutmaßlichen Verstoßes zu. Das Beschwerderecht
              besteht unbeschadet anderweitiger verwaltungsrechtlicher oder
              gerichtlicher Rechtsbehelfe.
            </Typography>
            <Typography>
              Wenn Sie glauben, dass wir Ihrem Anliegen nicht oder nicht in
              vollem Umfang nachgekommen sind, können Sie bei der für den LGV
              zuständigen Datenschutzaufsichtsbehörde Beschwerde einlegen:
            </Typography>
            <Grid sx={{ border: "1px solid black", padding: 2, width: "100%" }}>
              Der Hamburgische Beauftragte für Datenschutz und
              Informationsfreiheit
              <br />
              <br />
              Ludwig-Erhard-Straße 22, 20459 Hamburg
              <br />
              <br />
              Tel.: +49 40 42854 4040
              <br />
              <br />
              E-Fax: +49 40 4279 11811
              <br />
              <br />
              E-Mail: mailbox@datenschutz.hamburg.de
              <br />
            </Grid>
            <Typography variant="h6">
              Allgemeine Hinweise zu diesen Rechten
            </Typography>
            <Typography>
              Wir antworten grundsätzlich innerhalb eines Monats, nachdem wir
              Ihren Antrag erhalten haben. Wenn wir länger als einen Monat für
              eine abschließende Klärung brauchen, erhalten Sie eine
              Zwischennachricht. Wenn es Gründe gibt, warum wir Ihr Anliegen
              nicht erfüllen können, teilen wir Ihnen dies mit. Sie erhalten in
              jedem Fall eine Nachricht von uns.
            </Typography>
            <Typography variant="h6">
              8. Weitere Hinweise zur Datenerfassung: Verwendung von Cookies
            </Typography>
            <Typography>
              Unser Online-Dienst verwendet so genannte „Cookies“. Cookies sind
              kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden
              an. Sie werden entweder vorübergehend für die Dauer einer Sitzung
              (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem
              Endgerät gespeichert. Session-Cookies werden nach Ende Ihres
              Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem
              Endgerät gespeichert, bis Sie diese selbst löschen oder eine
              automatische Löschung durch Ihren Webbrowser erfolgt. Cookies
              können von uns (First-Party-Cookies) oder von Drittunternehmen
              stammen (sog. Third-Party-Cookies). Third-Party-Cookies
              ermöglichen die Einbindung bestimmter Dienstleistungen von
              Drittunternehmen innerhalb von Webseiten (z. B. Cookies zur
              Abwicklung von Zahlungsdienstleistungen). Cookies haben
              verschiedene Funktionen. Zahlreiche Cookies sind technisch
              notwendig, da bestimmte Webseitenfunktionen ohne diese nicht
              funktionieren würden (z. B. die Warenkorbfunktion oder die Anzeige
              von Videos). Andere Cookies können zur Auswertung des
              Nutzerverhaltens oder zu Werbezwecken verwendet werden. Cookies,
              die zur Durchführung des elektronischen Kommunikationsvorgangs,
              zur Bereitstellung bestimmter, von Ihnen erwünschter Funktionen
              (z. B. für die Warenkorbfunktion) oder zur Optimierung der Website
              (z. B. Cookies zur Messung des Webpublikums) erforderlich sind
              (notwendige Cookies), werden auf Grundlage von Art. 6 Abs. 1 lit.
              f DSGVO gespeichert, sofern keine andere Rechtsgrundlage angegeben
              wird. Der Websitebetreiber hat ein berechtigtes Interesse an der
              Speicherung von notwendigen Cookies zur technisch fehlerfreien und
              optimierten Bereitstellung seiner Dienste. Sofern eine
              Einwilligung zur Speicherung von Cookies und vergleichbaren
              Wiedererkennungstechnologien abgefragt wurde, erfolgt die
              Verarbeitung ausschließlich auf Grundlage dieser Einwilligung
              (Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG); die
              Einwilligung ist jederzeit widerrufbar. Sie können Ihren Browser
              so einstellen, dass Sie über das Setzen von Cookies informiert
              werden und Cookies nur im Einzelfall erlauben, die Annahme von
              Cookies für bestimmte Fälle oder generell ausschließen sowie das
              automatische Löschen der Cookies beim Schließen des Browsers
              aktivieren. Bei der Deaktivierung von Cookies kann die
              Funktionalität der Website eingeschränkt sein.
            </Typography>
          </Grid>
        </PageContainer>
      </Grid>
      <Footer />
    </Grid>
  );
}
