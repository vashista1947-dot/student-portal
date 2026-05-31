/**
 * Generates the official HTML invitation template for NSUT placement hiring
 * @param {string} companyName - Name of the hiring company
 * @param {Array<{name: string, phone: string}>} coordinators - Placement coordinators
 * @returns {string} HTML content
 */
const getInvitationHtml = (companyName, coordinators) => {
  const coordinatorsHtml = coordinators
    .map(c => `${c.name}${c.phone ? ' | ' + c.phone : ''}`)
    .join('<br/>');

  return `
    <div style="font-family: Verdana, sans-serif; font-size: 14px; color: #000000; line-height: 1.6;">
      <p>Dear Team,<br/>Warm Greetings from NSUT!</p>

      <p>We would like to extend an official invitation to your esteemed organisation to participate in the <b>Placement Season 2026-27</b> for our B.Tech./ M.Tech./B.Design batch of 2027 and 2028.</p>

      <p>NSUT, formerly NSIT, has been a beacon of academic excellence since its establishment in 1983. It is one of India's premier Tier-1 engineering universities, consistently ranked among the best: <b>#57 in NIRF (Engineering) 2024</b>, <b>#18 in IIRF (Top Govt. Engineering Colleges 2024)</b> and <b>#2 in IIRF (Top Govt. Engineering Colleges in Delhi 2024)</b>, #2 in TIMES AIEIR Survey 2024, #7 in India Today 2024, #5 in ARIIA 2024 and #8 in India's Today(Top Engineering Colleges in 2025). Our rigorous admission process ensures that NSUT admits top-performing students, with only the <b>top 10% scorers of IIT-JEE (Mains & Advanced)</b> and <b>top 15% scorers of GATE</b> earning a place in our prestigious institution. The remarkable achievements of our students in various fields show the quality of talent NSUT nurtures and delivers year after year.</p>

      <p>To provide a closer look at our offerings and the expertise of the students, here's an overview of our programs:</p>

      <p><b>1) Academic Programs and Specialization</b></p>

      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 13px; border-color: #000;">
        <thead>
          <tr>
            <th colspan="5" style="text-align: center;">Streams</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="2"><b>B.TECH</b></td>
            <td>Computer Science Engineering<br/>a) Computer Engineering (CSE)<br/>b) Artificial Intelligence (CSAI)<br/>c) Data Science (CSDS)<br/>d) Big Data Analytics (CSDA)<br/>e) Internet of Things (CIOT)<br/>f) Mathematics and Computing (CSE-MAC)</td>
            <td>Information Technology<br/>a) Information Technology (IT)<br/>b) Network Security (ITNS)<br/>c) Geoinformatics (ITGI)</td>
            <td>Electronics and Communication Engineering<br/>a) Electronics and Communication Engineering (ECE)<br/>b) Artificial Intelligence and Machine Learning (ECE - AI/ML)<br/>c) Internet of Things (EIOT)<br/>d) VLSI Design and Technology (EVDT)</td>
            <td>Bio-Technology (BT)</td>
          </tr>
          <tr>
            <td>Instrumentation and Control Engineering (ICE)</td>
            <td>Electrical Engineering (EE)</td>
            <td>Mechanical Engineering<br/>a) Mechanical Engineering (ME)<br/>b) Electric Vehicles (MEEV)</td>
            <td>Civil Engineering (CE)</td>
          </tr>
          <tr>
            <td><b>M.TECH</b></td>
            <td>Computer Science Engineering<br/>a) Computer Engineering (PCS)<br/>b) Artificial Intelligence (PAI)<br/>c) Information Security (PIS)</td>
            <td>Information Technology (PIT)</td>
            <td>Electronics and Communication Engineering<br/>a) Embedded System and VLSI (PEVLSI)<br/>b) VLSI (PVLSI)</td>
            <td>Bio-Informatics (PBI)</td>
          </tr>
          <tr>
            <td><b>B.Design</b></td>
            <td>Product Design</td>
            <td>UI/UX Design</td>
            <td>Visual Design</td>
            <td>Graphic Design</td>
          </tr>
          <tr>
            <td></td>
            <td>Product Management</td>
            <td colspan="3">Fashion Technology</td>
          </tr>
          <tr>
            <td><b>MBA</b></td>
            <td>Business Analytics</td>
            <td>Marketing</td>
            <td>Operations</td>
            <td>Human Resources</td>
          </tr>
          <tr>
            <td></td>
            <td>Finance</td>
            <td colspan="3"></td>
          </tr>
        </tbody>
      </table>

      <p><b>2) Notable recruiters from the Placement Season</b></p>

      <p><b>Technical:</b> Microsoft, Google, Apple, Tower Research Capital, Goldman Sachs, IBM, Uber, D.E. Shaw, Morgan Stanley, Rippling, Walmart, Atlassian, Media.net, Intuit, Fast Retailing, Salesforce, Samsung, Phonepe, Meesho, DP World, Swiggy, Cisco, Gamescraft, Arcesium, PayPal, CoinSwitch, Winzo and more.</p>

      <p><b>Non-Technical:</b> Bain & Company, Boston Consulting Group (BCG), McKinsey & Company, Ebullient Securities, HashedIn by Deloitte, American Express, Blackrock, Zomato, HSBC, KPMG, EY, Mastercard, FutureFirst, Axxela, ZS Associates, J.P. Morgan, ION, Trinity, LEK, Thorogood, Axis Bank, Kroll and more.</p>

      <p><b>Core:</b> Texas Instruments, Cadence, Nvidia, Qualcomm, Mediatek, NXP Semiconductors, STMicroelectronics, Maruti Suzuki, Adani Group, Reliance Group of Industries, Tata Group, KIA, Schlumberger, Siemens, Hero MotoCorp, Honda, Bureau of Indian Standards, Idemitsu and more.</p>

      <p><b>PSUs:</b> GAIL, BPCL, TCIL, EIL, CDOT and more</p>

      <p><b>3) For the Placement Season 2026-27, we offer access to:</b></p>

      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 13px; border-color: #000;">
        <thead>
          <tr>
            <th colspan="3" style="text-align: center;"><b>2027 Batch</b></th>
            <th colspan="3" style="text-align: center;"><b>2028 Batch</b></th>
          </tr>
          <tr>
            <th></th>
            <th>Program</th>
            <th>Duration</th>
            <th></th>
            <th>Program</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="3"><b>B.Tech / B.Design</b></td>
            <td>6 month Internship + Full Time Employment</td>
            <td>January 2027 - June 2027</td>
            <td rowspan="3"><b>B.Tech / B.Design</b></td>
            <td rowspan="3">2 month Intern + Performance based PPO</td>
            <td rowspan="3">May 2027 - July 2027</td>
          </tr>
          <tr>
            <td>6 month Internship+Performance based PPO</td>
            <td>January 2027 - June 2027</td>
          </tr>
          <tr>
            <td>Full Time Employment</td>
            <td>July 2027</td>
          </tr>
          <tr>
            <td rowspan="2"><b>M.Tech / MBA</b></td>
            <td>6 month Internship+Performance based PPO</td>
            <td>January 2027 - June 2027</td>
            <td rowspan="2"><b>M.Tech / MBA</b></td>
            <td>2 month intern + Performance based PPO</td>
            <td>May 2027 - July 2027</td>
          </tr>
          <tr>
            <td>Full Time Employment</td>
            <td>July 2027</td>
            <td></td>
            <td>11 months intern + Performance Based</td>
            <td>August 2027 - June 2028</td>
          </tr>
        </tbody>
      </table>

      <p>Attached to this email is our brochure and a <b>Campus Recruitment Form (CRF)</b>, which we request you to fill as part of the placement process. We would be delighted to host your team at our university at your earliest convenience and are committed to offering you a preferred slot along with access to the finest talent pool from NSUT.</p>

      <p>We look forward to a positive and enthusiastic response from your end and hope to build a lasting partnership through your participation in this placement season. If you have any queries or require further information, please feel free to contact the undersigned.</p>

      <p>Warm Regards,</p>

      <p>${coordinatorsHtml}<br/>Placement Coordinator</p>

      <p>___________________________________________________________</p>

      <table style="border: none; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle; padding-right: 15px; border: none;">
            <img src="cid:nsutlogo" alt="NSUT Logo" style="width: 120px; height: 120px;" />
          </td>
          <td style="vertical-align: top; font-size: 13px; border: none; line-height: 1.5;">
            <b>Mr. Rajesh Rawat</b>, Assistant Coordinator,<br/>
            Mob: +91-9810472670<br/>
            Email: <a href="mailto:rajesh.rawat@nsut.ac.in">rajesh.rawat@nsut.ac.in</a><br/><br/>
            <b>Dr. M.P.S. Bhatia</b>, Professor in Charge,<br/>
            Mob: +91-9818192294<br/>
            Email: <a href="mailto:mpsbhatia@nsut.ac.in">mpsbhatia@nsut.ac.in</a>
          </td>
        </tr>
      </table>

      <p style="font-size: 11px; color: #666;">This e-mail, including any attached files, may contain confidential and privileged information for the sole use of the intended recipient. Any review, use, distribution, or disclosure by others is strictly prohibited. If you are not the intended recipient (or authorized to receive information for the intended recipient), please contact the sender by reply e-mail and delete all copies of this message.</p>
    </div>
  `;
};

module.exports = { getInvitationHtml };
