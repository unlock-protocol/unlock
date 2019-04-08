import PropTypes from 'prop-types'

export const delay = PropTypes.number

export const post = PropTypes.shape({
  title: PropTypes.string,
  description: PropTypes.string,
  subTitle: PropTypes.string,
  authorName: PropTypes.string,
  publishDate: PropTypes.string,
  __content: PropTypes.string,
})

export const slug = PropTypes.string

export const postFeed = PropTypes.array

export default {
  slug,
  post,
  delay,
  postFeed,
}
