const { exec } = require("child_process");
const fs = require("fs/promises");
const baseUrl = "https://www.caratlane.com";

const urls = [
  "/jewellery/utsav.html",
  "",
  "/jewellery/best+sellers.html",
  "/cart/shopping-cart",
  "/jewellery/flat+20+percent+off+on+diamond+prices.html",
  "/catalogsearch/result?q=diamond",
  "/jewellery/ready+to+ship.html",
  "/gold-exchange",
  "/jewellery.html",
  "/ear-piercing",
  "/plan-of-purchase",
  "/try-at-home",
  "/jewellery/necklaces.html",
  "/jewellery/manorama-diamond-mangalsutra-js00820-1yp600.html",
  "/jewellery/sygnet-diamond-personalised-band-jr08028-1yp900.html",
  "/jewellery/gold.html",
  "/jewellery/lacy-notes-diamond-necklaces-jl04815-1yp900.html",
  "/jewellery/ikshita-gold-drop-earrings-ue04920-yg0000.html",
  "/jewellery/mangalsutra.html",
  "/jewellery/milda-infinity-diamond-mangalsutra-js01113-1yp900.html",
  "/jewellery/luke-solitaire-stud-for-men-se00161-wgp900.html",
  "/jewellery/twin-infinity-diamond-pendant-jp00791-ygp600.html",
  "/myaccount/plan-of-purchase",
  "/postcards",
  "/jewellery/tia-twine-solitaire-ring-sr02482-rgp900.html",
  "/silver-shaadisquad",
  "/stores/delhincr/catalog",
  "/returns-exchanges",
  "/jewellery/adaa.html",
  "/jewellery/aaliya-infinity-diamond-mangalsutra-js01112-1yp600.html",
  "/jewellery/elen-cluster-diamond-ring-jr03351-ygp600.html",
  "/jewellery/teensy-wave-diamond-ring-jr07852-1yp600.html",
  "/jewellery/isha-delight-diamond-nose-pin-jn00048-ygp900.html",
  "/jewellery/akshita-diamond-mangalsutra-js00526-1yp600.html",
  "/fashion-jewellery",
  "/jewellery/vedika-diamond-mangalsutra-bracelet-jt00415-ygp600.html",
  "/jewellery/adinra-diamond-hoop-earrings-je07382-1yp900.html",
  "/jewellery/roxane-diamond-ring-jr05095-ygp600.html",
  "/jewellery/rings.html",
  "/jewellery/fluttering-alphabet-s-diamond-mangalsutra-js01641-1yp900.html",
  "/silver-likealotus",
  "/jewellery/adhira-cluster-diamond-stud-earrings-je03085-ygp600.html",
  "/jewellery/s-cluster-diamond-hoop-earrings-je02852-ygp600.html",
  "/jewellery/renica-diamond-band-jr07318-1yp900.html",
  "/wishlist",
  "/silver",
  "/jewellery/darshi-gemstone-necklace-jl04571-1yp9p0.html",
  "/jewellery/flare-diamond-personalised-band-jr08027-1yp900.html",
  "/jewellery/alpona.html",
  "/jewellery/shimmering-cluster-promise-diamond-ring-jr04423-ygp600.html",
];

const generateReport = (url, retries = 0) => {
  const maxRetries = 3;
  return new Promise((resolve, reject) => {
    const fileName = url.replace(/[^a-zA-Z0-9]/g, "_")
      ? url.replace(/[^a-zA-Z0-9]/g, "_")
      : "homepage";
    const htmlFilePath = `./reports/${fileName}.report.html`;
    const jsonFilePath = `./reports/${fileName}.report.json`;
    const command = `lighthouse ${baseUrl}${url} --output json --output html --output-path reports/${fileName}  --max-wait-for-load=60000`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log("Error", error);
        if (retries < maxRetries) {
          console.warn(
            `Retrying report generation for ${url} (${
              retries + 1
            }/${maxRetries})`
          );
          return resolve(generateReport(url, retries + 1));
        } else {
          console.error(
            `Failed to generate report for ${url} after ${maxRetries} retries: ${error}`
          );
          return reject(error);
        }
      }
      resolve({ url, htmlFilePath, jsonFilePath });
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  });
};

const parseJsonReport = async (jsonFilePath) => {
  try {
    const jsonData = await fs.readFile(jsonFilePath, "utf-8");
    const report = JSON.parse(jsonData);
    const coreWebVitals = {
      LCP: report.audits["largest-contentful-paint"].displayValue,
      FID: report.audits["max-potential-fid"].displayValue,
      SI: report.audits["speed-index"].displayValue,
      CLS: report.audits["cumulative-layout-shift"].displayValue,
      TBT: report.audits["total-blocking-time"].displayValue,
      page: report.audits["final-screenshot"].details.data,
      timeline: report.audits["screenshot-thumbnails"].details.items,
    };

    const performanceMetrics = report.categories["performance"].score;
    const accessibilityMetrics = report.categories["accessibility"].score;
    const seoMetrics = report.categories["seo"].score;
    return {
      ...coreWebVitals,
      performanceMetrics,
      accessibilityMetrics,
      seoMetrics,
    };
  } catch (error) {
    console.error("Error parsing JSON report:", error);
    return null;
  }
};

const generateHTML = (reports) => {
  console.log("reports", reports);
  const htmlContent = `
    <html>
    <head>
        <title>CL Performance Report</title>
        <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Shared styles for both light and dark modes */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        h1 {
            text-align: center;
            margin-top: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #dddddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        /* Dark mode styles */
        body.dark-mode {
            background-color: #222;
            color: #fff;
        }

        table.dark-mode th {
            background-color: #444;
            border-color: #666;
        }

        table.dark-mode td {
            border-color: #666;
        }

        /* Light mode toggle button */
        .toggle-btn {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
        }
    </style>
       
    </head>
    <body>
    <header>
        <h1>CL Performance Report</h1>
        <button id="toggleMode">Toggle Mode</button>
    </header>
    <main id="mainContent">
      
        <table>
            <tr>
                <th>Page</th>
                <th>URL</th>
                <th>HTML Report</th>
                <th>LCP</th>
                <th>FID</th>
                <th>SI</th>
                <th>CLS</th>
                <th>TBT</th>
                <th>Performance</th>
                <th>Accessibility</th>
                <th>SEO</th>
            </tr>
            ${reports
              .map(
                (report) => `
                <tr>
                    <td><image src=${report.page} width="100px" height="200px"/></td>
                    <td>${report.url}</td>
                    <td><a href="${report.htmlFilePath}">${report.url}</a></td>
                    <td>${report.LCP}</td>
                    <td>${report.FID}</td>
                    <td>${report.SI}</td>
                    <td>${report.CLS}</td>
                    <td>${report.TBT}</td>
                    <td>${report.performanceMetrics}</td>
                    <td>${report.accessibilityMetrics}</td>
                    <td>${report.seoMetrics}</td>
                </tr>
            `
              )
              .join("")}
        </table>
         </main>
        <script>const toggleButton = document.getElementById('toggleMode');
const mainContent = document.getElementById('mainContent');

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
</script>
    </body>
    </html>
    `;

  return fs.writeFile("final_report.html", htmlContent);
};

const analyzeReports = async (reports) => {
  const finalReport = [];
  for (const report of reports) {
    try {
      const { jsonFilePath } = report;
      const metrics = await parseJsonReport(jsonFilePath);
      finalReport.push({ ...report, ...metrics });
    } catch (error) {
      console.error("Error analyzing report:", error);
    }
  }
  console.log("final report", finalReport);
  return finalReport;
};

const runLighthouse = async () => {
  const reports = [];
  for (const url of urls) {
    try {
      const {
        url: reportUrl,
        htmlFilePath,
        jsonFilePath,
      } = await generateReport(url);
      reports.push({ url: reportUrl, htmlFilePath, jsonFilePath });
      console.log(`Report for ${reportUrl} generated successfully.`);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  }
  const finalReport = await analyzeReports(reports);
  await generateHTML(finalReport);
  console.log("All reports generated, analyzed, and email sent.");
};

module.exports = { runLighthouse };
