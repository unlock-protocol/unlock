export const base = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Unlock</title>
    <style>
      @media only screen and (max-width: 620px) {
        table.body h1 {
          font-size: 36px !important;
          line-height: 40px;
          margin-bottom: 12px !important;
        }

        table.body p,
        table.body ul,
        table.body ol,
        table.body td,
        table.body span,
        table.body a {
          font-size: 16px !important;
        }

        table.body .wrapper,
        table.body .article {
          padding: 10px !important;
        }

        table.body .content {
          padding: 0 !important;
        }

        table.body .container {
          padding: 0 !important;
          width: 100% !important;
        }

        table.body .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }

        table.body .btn table {
          width: 100% !important;
        }

        table.body .btn a {
          width: 100% !important;
        }

        table.body .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important;
        }
      }
      @media all {
        .ExternalClass {
          width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }

        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }

        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }

        .btn-primary table td:hover {
          background-color: #603deb !important;
        }

        .btn-primary a:hover {
          background-color: #bfb1f7 !important;
          border-color: #bfb1f7 !important;
        }
      }
      p, ul, ol, li {
        font-size: 16px;
        font-weight: normal;
        margin-bottom: 8px;       
      }
    
      body {
        font-family: sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 16px;
      }

      h1 {
        font-size: 20px;
        line-height: 32px;
        font-weight: bold;
        margin: 0;
        margin-bottom: 16px;
      }

      h2 {
        font-size: 18px;
        line-height: 24px;
        font-weight: bold;
        margin: 0;
        margin-bottom: 12px;
      }
      
      code {
        font-size: 14px;
        border-radius: 0.375rem;
        font-weight: 500;
        border-style: solid;
        border-width: 1px;
        border-color: rgb(203 213 225);
        background-color: rgb(241 245 249);
        padding: 0.125rem 0.25rem;
      }

      a {
        color: #603deb !important;
        text-decoration: underline;
      }
    </style>
  </head>
  <body style="
      background-color: #fffaf1;
      font-family: sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 16px;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    ">
    <table
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      class="body"
      style="
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        background-color: #fffaf1;
        width: 100%;
      "
      width="100%"
      bgcolor="#FFFAF1"
    >
      <tr>
        <!-- Spacer -->
        <td
          style="font-family: sans-serif; font-size: 14px; vertical-align: top"
          valign="top"
        >
          &nbsp;
        </td>

        <!-- Main Section -->
        <td
          class="container"
          style="
            font-family: sans-serif;
            font-size: 14px;
            vertical-align: top;
            display: block;
            max-width: 580px;
            padding: 10px;
            width: 580px;
            margin: 0 auto;
          "
          width="580"
          valign="top"
        >
          <div
            class="content"
            style="
              box-sizing: border-box;
              display: block;
              margin: 0 auto;
              max-width: 580px;
              padding: 10px;
            "
          >
            <!-- START CENTERED WHITE CONTAINER -->
            <table
              role="presentation"
              class="main"
              style="
                border-collapse: separate;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background: #ffffff;
                border-radius: 3px;
                width: 100%;
              "
              width="100%"
            >
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td
                  class="wrapper"
                  style="
                    font-family: sans-serif;
                    font-size: 16px;
                    vertical-align: top;
                    box-sizing: border-box;
                    padding: 24px;
                  "
                  valign="top"
                >
                  <!-- logo header end -->
                  <table
                    role="presentation"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      border-collapse: separate;
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      width: 100%;
                    "
                    width="100%"
                  >
                    <tr>
                      <td
                        style="
                          font-family: sans-serif;
                          font-size: 16px;
                          vertical-align: top;
                        "
                        valign="top"
                      >
                        {{{content}}}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- END CENTERED WHITE CONTAINER -->

            <!-- START FOOTER-->
            <div
              class="footer"
              style="
                clear: both;
                margin-top: 16px;
                text-align: center;
                width: 100%;
              "
            >
              <table
                role="presentation"
                border="0"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-collapse: separate;
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  width: 100%;
                "
                width="100%"
              >
                <tr>
                  <td
                    class="content-block"
                    style="
                      font-family: sans-serif;
                      vertical-align: top;
                      padding-bottom: 10px;
                      padding-top: 10px;
                      color: #999999;
                      font-size: 16px;
                    "
                    valign="top"
                    align="center"
                  >
                    <a
                        href="https://unlock-protocol.com/"
                        target="_blank"
                        style="color: #373a3e; text-decoration: none"
                        ><img width="120" src="{{inlineImage 'logo-unlock-events.png'}}" /></a
                      >
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->
          </div>
        </td>

        <td
          style="font-family: sans-serif; font-size: 14px; vertical-align: top"
          valign="top"
        >
          &nbsp;
        </td>
      </tr>
    </table>
  </body>
</html>`

export default base
