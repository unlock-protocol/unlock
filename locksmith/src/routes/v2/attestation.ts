import express from 'express'
import { AttestationController } from '../../controllers/v2/attestationController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router: express.Router = express.Router({ mergeParams: true })

const attestationController = new AttestationController()

// Create a new attestation (lock manager only)
router.post(
  '/:network/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => attestationController.createAttestation(req, res)
)

// Get all attestations for a lock (lock manager only)
router.get(
  '/:network/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => attestationController.listAttestations(req, res)
)

// Get attestations by tokenId (lock manager only)
router.get(
  '/:network/:lockAddress/token/:tokenId',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => attestationController.getAttestationsByTokenId(req, res)
)

// Get attestations for the authenticated user (key holder)
// Must be before /:attestationId route to avoid being captured
router.get(
  '/:network/:lockAddress/my-attestations',
  authenticatedMiddleware,
  (req, res) => attestationController.getMyAttestations(req, res)
)

// Download attestation certificate as PDF (key holder)
// Must be before /:attestationId route to avoid being captured
router.get(
  '/:network/:lockAddress/:attestationId/download',
  authenticatedMiddleware,
  (req, res) => attestationController.downloadAttestationCertificate(req, res)
)

// Get a specific attestation by attestationId (lock manager only)
router.get(
  '/:network/:lockAddress/:attestationId',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => attestationController.getAttestation(req, res)
)

export default router
