import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import Layout from '../interface/Layout'
import Signature from '../interface/Signature'
import {
  Section,
  Title,
  SubTitle,
  Paragraph,
  UnorderedList,
  ListItem,
  Strong,
  Em,
} from '../Components'
import { pageTitle } from '../../constants'

export const PrivacyContent = () => (
  <Layout forContent>
    <Head>
      <title>{pageTitle('Privacy Policy')}</title>
    </Head>
    <Section>
      <Title>Privacy Policy</Title>
      <Paragraph>Last modified: January 22, 2019</Paragraph>

      <SubTitle>Introduction</SubTitle>
      <Paragraph>
        Unlock, Inc. (&ldquo;
        <Strong>Unlock</Strong>
        &rdquo; or &ldquo;
        <Strong>We</Strong>
        &rdquo;) respect your privacy and are committed to protecting it through
        our compliance with this Privacy Policy.
      </Paragraph>

      <SubTitle>What Does This Privacy Policy Cover?</SubTitle>
      <Paragraph>
        This Privacy Policy describes the types of information we may collect
        from you or that you may provide when you use, access or visit our
        website and domain name (unlock-protocol.com, the &ldquo;
        <Strong>Site</Strong>
        &rdquo;) and/or our Services. Our &ldquo;
        <Strong>Services</Strong>
        &rdquo; mean, collectively, the Site and any services, content,
        applications, features, including any protocols and components thereof,
        which may exist now or in the future and which Unlock may offer from
        time to time.
      </Paragraph>
      <Paragraph>
        This Privacy Policy applies to information we collect:
      </Paragraph>
      <UnorderedList>
        <ListItem>On our via the Services.</ListItem>
        <ListItem>
          In email, text, and other electronic messages between you and the
          Services.
        </ListItem>
        <ListItem>
          through mobile and desktop applications you download from the
          Services, which provide dedicated non-browser-based interaction
          between you and the Services.
        </ListItem>
        <ListItem>
          When you interact with applications on third-party websites and
          services, if those applications or advertising include links to this
          Privacy Policy.
        </ListItem>
      </UnorderedList>
      <Paragraph>It does not apply to information collected by:</Paragraph>
      <UnorderedList>
        <ListItem>
          us offline or through any other means, including on any other website
          operated by Unlock or any third party; or
        </ListItem>
        <ListItem>
          any third party that may link to or be accessible from or via the
          Services.
        </ListItem>
        <ListItem>
          This Privacy Policy does not apply to the practices of companies that
          Unlock does not own or control, or to individuals that Unlock does not
          employ, engage or manage.
        </ListItem>
      </UnorderedList>
      <Paragraph>
        Please read this Privacy Policy carefully to understand our policies and
        practices regarding your information and how we will treat it.{' '}
        <Strong>
          If you do not agree with these terms, your choice is to not use our
          Services. By accessing or using the Services, you agree to this
          Privacy Policy. This Privacy Policy may change from time to time (see
          “Can Unlock make changes to this Privacy Policy?”).
        </Strong>{' '}
        Your continued use of the Services after we make changes is deemed
        acceptance of those changes, so please check the Privacy Policy
        periodically for updates.
      </Paragraph>

      <SubTitle>
        Is anyone under the Age of 16 permitted to Use or Access Services?
      </SubTitle>
      <Paragraph>
        Our Services are not intended for children under 16 years of age. No one
        under age 16 may provide any personal information to or via the
        Services. We do not knowingly collect personal information from children
        under 16. If you are under 16, do not use or provide any information on
        via the Services or on or through any of its features/register with us,
        make any purchases through the Services, use any of the interactive or
        public comment features of the Services or provide any information about
        yourself to us, including your name, address, telephone number, email
        address, or any screen name or user name you may use. If we learn we
        have collected or received personal information from a child under 16
        without verification of parental consent, we will delete that
        information. If you believe we might have any information from or about
        a child under 16, please contact us at
        <Link href="mailto:hello@unlock-protocol.com">
          <a>mailto:hello@unlock-protocol.com</a>
        </Link>
        .
      </Paragraph>

      <SubTitle>What Personal Information does Unlock collect?</SubTitle>
      <Paragraph>
        The information we gather from users enables us to personalize and
        improve the Services and Services. We collect the following types of
        information from our users:
      </Paragraph>
      <Paragraph>
        <Em>Personal Information You Provide to Us:</Em> In order to use certain
        features of the Services, you must first connect your Ethereum wallet to
        the Services. We receive and may store any information you enter via the
        Services or which is provided to us in any other way. Some of the
        information we collect and store could be personally identifiable
        information (&ldquo;
        <Strong>Personal Information</Strong>
        &rdquo;) which may include your Ethereum address, name, physical or
        mailing address, email address, phone number, credit card and/or other
        payment information, IP address, browser information, use information,
        username, password, and any other information necessary for us to
        provide the Services.
      </Paragraph>
      <Paragraph>
        You can choose not to provide us with certain information, but then you
        may not be able to take advantage of our features. The Personal
        Information you provide is used for such purposes as answering
        questions, sending product updates, and communicating with you about
        Unlock&rsquo;s products and services, including specials and new
        features.
      </Paragraph>
      <Paragraph>
        <Em>Personal Information Collected Automatically:</Em>
      </Paragraph>
      <UnorderedList>
        <ListItem>
          We receive and store certain types of information whenever you
          interact with the Services. Unlock automatically receives and records
          information on our server logs from your browser including your IP
          address, cookie information, and the page you requested.
        </ListItem>
        <ListItem>
          Generally, our service automatically collects usage information, such
          as the numbers and frequency of visitors to the Services and its
          components. We only uses this data in aggregate form, that is, as a
          statistical measure, and not in a manner that would identify you
          personally. This type of aggregate data enables us to figure out how
          often users use parts of Services so that we can make the Services
          appealing to as many users as possible, and improve those services. As
          part of this use of information, we may provide aggregate information
          to our partners about how our users, collectively, use the Services.
          We may share this type of statistical data so that our partners also
          understand how often people use the Services, so that they, too, may
          provide you with an optimal online experience. Again, Unlock never
          discloses aggregate information to a partner in a manner that would
          identify you personally.
        </ListItem>
      </UnorderedList>
      <Paragraph>
        <Em>E-mail Communications:</Em> We often receive a confirmation when you
        open an email from Unlock if your computer supports this type of
        program. Unlock uses this confirmation to help us make emails more
        interesting and helpful. We also compare our user list to lists received
        from other companies, in an effort to avoid sending unnecessary messages
        to our users. When you receive e-mail from Unlock, you can opt out of
        receiving further e-mails by following the included instructions to
        unsubscribe.
      </Paragraph>

      <SubTitle>What about Cookies?</SubTitle>
      <UnorderedList>
        <ListItem>
          Cookies are alphanumeric identifiers that we transfer to your
          computer&rsquo;s hard drive through your browser to enable our systems
          to recognize your browser and tell us how and when pages in our site
          are visited and by how many people. Please note that we may use
          cookies to enhance visitors&rsquo; experiences, to learn more about
          their use of the Services and to improve quality.
        </ListItem>
        <ListItem>
          Most browsers have an option for turning off the cookie feature, which
          will prevent your browser from accepting new cookies, as well as
          (depending on the sophistication of your browser software) allowing
          you to decide on acceptance of each new cookie in a variety of ways.
          We strongly recommend that you leave the cookies activated, however,
          because cookies enable you to take advantage of some of the Services
          most attractive features.
        </ListItem>
      </UnorderedList>

      <SubTitle>
        Will Unlock share any of the Personal Information it receives?
      </SubTitle>
      <Paragraph>
        Personal Information about our users is an integral part of our
        business. We neither rent nor sell your Personal Information to anyone.
        We share your Personal Information only as described below. We may
        disclose aggregated information about our users, and information that
        does not identify any individual, without restriction.
      </Paragraph>
      <Paragraph>
        <Em>Affiliated Businesses We Do Not Control:</Em> We anticipate that we
        may become affiliated with a variety of businesses and work closely with
        them. In certain situations, these businesses may sell items to you
        through the Services. In other situations, Unlock may provide services,
        or sell products jointly with affiliated businesses. You can easily
        recognize when an affiliated business is associated with your
        transaction, and we will share your Personal Information that is related
        to such transactions with that affiliated business.
      </Paragraph>
      <Paragraph>
        <Em>Contractors:</Em> We engage with other companies and individuals to
        perform tasks on our behalf and may need to share your information with
        them to provide products or services to you. Unless we tell you
        differently, Unlock’s suppliers do not have any right to use your
        Personal Information we share with them beyond what is necessary to
        assist us. You hereby consent to our sharing of your Personal
        Information for the above purposes.
      </Paragraph>
      <Paragraph>
        <Em>User profiles:</Em> User profile information including users&rsquo;
        name, email address, and other information you enter (&ldquo;User
        Submissions&rdquo;) may be displayed to other users to facilitate user
        interaction within the Services. Email addresses are used to add new
        User Submissions to user profiles and to communicate through User
        Submissions. Users&rsquo; email addresses will not be directly revealed
        to other users by Unlock, except, when the user is
        &ldquo;connected&rdquo; to another user via a shared group membership,
        or an invitation, or if the user has chosen to include their email
        address in their user profile.
      </Paragraph>
      <Paragraph>
        <Em>Communication in response to User Submissions:</Em> As part of the
        Services, you will receive from Unlock email and other communication
        relating to your User Submissions. You acknowledge and agree that by
        posting such User Submissions, Unlock may send you email and other
        communication that it determines in its sole discretion relate to your
        User Submissions.
      </Paragraph>
      <Paragraph>
        <Em>Promotional Offers:</Em> We may send offers to you on behalf of
        other businesses. However, when we do so, we do not give the other
        business your name and address. If you do not wish to receive these
        offers, please send an email with your request to
        hello@unlock-protocol.com.
      </Paragraph>
      <Paragraph>
        <Em>Business Transfers:</Em> Unlock may go through a business
        transition, such as a merger, acquisition by another company, or sale of
        all or portion of our assets. In these types of transactions, user
        information is typically one of the business assets that are
        transferred. Moreover, if Unlock, or substantially all of its assets
        were acquired, or in the unlikely event that Unlock goes out of business
        or enters bankruptcy, user information would be one of the assets that
        is transferred or acquired by a third party. You acknowledge that such
        transfers may occur, and that any acquirer of Unlock may continue to use
        your Personal Information as set forth in this Privacy Policy or as
        subject to the acquirer’s policy.
      </Paragraph>
      <Paragraph>
        <Em>Protection of Unlock and Others:</Em> We may release Personal
        Information when we believe in good faith that release is necessary to
        comply with the law; enforce or apply our conditions of use and other
        agreements; or protect the rights, property, or safety of Unlock, our
        employees, our users, or others. This includes exchanging information
        with other companies and organizations for fraud protection and credit
        risk reduction. You acknowledge and consent to such disclosure.
      </Paragraph>
      <Paragraph>
        <Em>Compliance with the Agreement:</Em> We may use Personal Information
        to the extent it is required to enforce or apply our Agreement [INSERT
        AS LINK TO TERMS OF USE] and other agreements, including for billing and
        collection purposes.
      </Paragraph>
      <Paragraph>
        <Em>With Your Consent:</Em> Except as set forth above, you will be
        notified when your Personal Information may be shared with third
        parties, and will be able to prevent the sharing of this information.
      </Paragraph>

      <SubTitle>Are there Risks with Transactions using Blockchain?</SubTitle>
      <Paragraph>
        To properly use and obtain benefit from the Services, you will need to
        connect to the Ethereum wallet blockchain. Please be aware that Unlock
        has no ownership, control or responsibility related to any blockchain
        technology, including Ethereum, and your connection with any third party
        site or technology is solely at your own risk. Be aware that when you
        use the Unlock Website, the following information may be written onto
        the Ethereum blockchain:
      </Paragraph>
      <UnorderedList>
        <ListItem>
          the cryptographic wallet address from which you submitted the
          transaction;
        </ListItem>
        <ListItem>
          the amount of the cryptocurrency which you send or receive; or
        </ListItem>
        <ListItem>
          the cryptographic wallet address to which you initiated the
          transaction.
        </ListItem>
      </UnorderedList>
      <Paragraph>
        A blockchain’s records cannot be changed or deleted. This may affect
        your ability to exercise your rights such as your right to erasure
        (“right to be forgotten”), the right to rectification of your data or
        your rights to object or restrict processing of your Personal
        Information. Data, including Personal Information, written to the
        Ethereum blockchain is public and cannot be erased.
      </Paragraph>

      <SubTitle>Is Personal Information about me secure?</SubTitle>
      <Paragraph>
        Your Personal Information associated with your account is protected by
        your wallet for your privacy and security. We have implemented measures
        designed to secure your Personal Information from accidental loss and
        from unauthorized access, use, alteration, and disclosure. It is your
        responsibility to ensure that there is no unauthorized access to your
        account and information by selecting and protecting your password
        appropriately and limiting access to your devices, including your
        computer and browser at all times, including when you sign off after you
        have finished accessing your account.
      </Paragraph>
      <Paragraph>
        Unfortunately, be aware that the transmission of information via the
        internet is not completely secure. Unlock cannot guarantee the security
        of user account information and unauthorized entry or use, hardware or
        software failure, and other factors, may compromise the security of your
        user information at any time. If you are not comfortable with the
        inherent risks, do not share or provide Personal Information to the
        Services.
      </Paragraph>
      <Paragraph>
        The Website contains links to other sites and technologies. Unlock is
        not responsible for the privacy policies and/or practices on other sites
        or with regard to other technologies. When linking to another site or
        technology, you should read the privacy policy stated on that site and
        only proceed forward if you are comfortable with the practices and
        policies.
      </Paragraph>

      <SubTitle>What Personal Information can I access?</SubTitle>
      <Paragraph>
        If Unlock stores any of your account information, you will be able to
        review and change your Personal Information stored by Unlock by logging
        into the Services and visiting your account profile page.
      </Paragraph>
      <Paragraph>
        You may also send us an email at{' '}
        <Link href="mailto:hello@unlock-protocol.com">
          <a>hello@unlock-protocol.com</a>
        </Link>{' '}
        to request access to, correct or delete any Personal Information that
        you have provided to us. We cannot delete your Personal Information
        except by also deleting your user account. We may not accommodate a
        request to change information if we believe the change would violate any
        law or legal requirement or cause the information to be incorrect.
      </Paragraph>
      <Paragraph>
        If you delete any of your user contributions from the Services, copies
        of these contributions may remain viewable in cached and archived pages,
        or might have been copied or stored by other Website users.
      </Paragraph>

      <SubTitle>What choices do I have?</SubTitle>
      <UnorderedList>
        <ListItem>
          As stated previously, you can always opt not to disclose information,
          even though it may be needed to take advantage of certain features of
          the Services.
        </ListItem>
        <ListItem>
          If Unlock stores any of your account information, you will be able to
          add or update certain information on pages, such as those listed in
          the &ldquo;What Personal Information can I access&rdquo; section
          above. When you update information, however, we often maintain a copy
          of the unrevised information in our records.
        </ListItem>
        <ListItem>
          You may request deletion of your account information from our servers
          by sending an e-mail to hello@unlock-protocol.com. Please note that
          some information may remain in our records after deletion of your
          account. Remember, we do not own or control any blockchain
          technologies and we cannot delete information present on the Ethereum
          blockchain or other decentralized networks at any time. Your use of
          any blockchain technologies are at your own risk.
        </ListItem>
        <ListItem>
          If you do not wish to receive email or other mail from us, please
          indicate this preference during the registration process. Please note
          that if you do not want to receive legal notices from us, such as this
          Privacy Policy, those legal notices will still govern your use of the
          Services, and you are responsible for reviewing such legal notices for
          changes.
        </ListItem>
      </UnorderedList>

      <SubTitle>Can Unlock make changes to this Privacy Policy?</SubTitle>
      <Paragraph>
        Unlock may amend this Privacy Policy from time to time. Use of
        information we collect now is subject to the Privacy Policy in effect at
        the time such information is used. If we make changes in the way we use
        Personal Information, we will notify you by posting an announcement on
        the Services or sending you an email. Users are bound by any changes to
        the Privacy Policy when he or she uses the Services after such changes
        have been first posted.
      </Paragraph>

      <SubTitle>What if I have questions or concerns?</SubTitle>
      <Paragraph>
        If you have any questions or concerns regarding privacy on the Services,
        please send us a detailed message at{' '}
        <Link href="mailto:hello@unlock-protocol.com">
          <a>hello@unlock-protocol.com</a>
        </Link>
        . We will make every effort to resolve your concerns.
      </Paragraph>
    </Section>

    <Signature />
  </Layout>
)

export default PrivacyContent
