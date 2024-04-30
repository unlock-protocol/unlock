import { useState } from 'react'

/**
 * Custom hook for managing state related to token-gated event rooms in the Huddle01 platform.
 * It handles the state for whether a huddle meeting is enabled, the selected network, and other functionalities/utilities.
 * @returns An object containing several utilities and state values related to the event room management.
 */
function useEventGatedRoom() {
  // State to track if the Huddle meeting option on the event form was checked
  const [isHuddleMeeting, setIsHuddleMeeting] = useState(false)

  // State to track the currently selected network/chain
  const [selectedHuddleNetwork, setSelectedHuddleNetwork] = useState('')

  // List of supported networks for Huddle meetings
  const huddleSupportedNetworks = ['ARBITRUM', 'ETHEREUM', 'POLYGON']

  /**
   * Formats an array of network names into a human-readable string.
   * For example, ['ETHEREUM', 'POLYGON'] becomes 'ETHEREUM, and POLYGON'.
   *
   * @param {string[]} networks - Array of network names.
   * @returns {string} Formatted string representing the list of networks.
   */
  function formatNetworks(networks: string[]) {
    if (networks.length > 1) {
      return (
        networks.slice(0, -1).join(', ') +
        ', and ' +
        networks[networks.length - 1]
      )
    }
    return networks.join('')
  }

  /**
   * Toggles the state of whether a huddle meeting is considered active or not.
   */
  const toggleHuddleMeeting = () => setIsHuddleMeeting((prev) => !prev)

  /**
   * Updates the selected network state to a new value, converting it to uppercase.
   *
   * @param {any} network - The new network value to be set.
   */
  const changeHuddleNetwork = (network: string) =>
    setSelectedHuddleNetwork(network.toUpperCase())

  return {
    isHuddleMeeting,
    toggleHuddleMeeting,
    selectedHuddleNetwork,
    formatNetworks,
    changeHuddleNetwork,
    huddleSupportedNetworks,
  }
}

export default useEventGatedRoom
