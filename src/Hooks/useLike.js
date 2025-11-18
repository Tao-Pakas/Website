// In your useLikeSystem hook, fix the mutations:
const useLikeSystem = (user) => {
  const [likedProperties, setLikedProperties] = useState([]);
  
  // FIXED: Use correct variable names
  const [likeMutation] = useMutation(LIKE_PROPERTY);
  const [unlikeMutation] = useMutation(UNLIKE_PROPERTY);

  const likeProperty = async (propertyId) => {
    if (!user) {
      throw new Error('User must be logged in to like properties');
    }

    try {
      if (isLiked(propertyId)) {
        throw new Error('Property already liked');
      }

      // FIXED: Use 'id' instead of 'documentId'
      await likeMutation({
        variables: { id: propertyId } // CHANGED: documentId → id
      });

      const newLikedProperties = [...likedProperties, propertyId];
      setLikedProperties(newLikedProperties);
      localStorage.setItem(`likedProperties_${user.id}`, JSON.stringify(newLikedProperties));

      return { success: true };
    } catch (error) {
      console.error('Error liking property:', error);
      return { success: false, error: error.message };
    }
  };

  const unlikeProperty = async (propertyId) => {
    if (!user) {
      throw new Error('User must be logged in to unlike properties');
    }

    try {
      // FIXED: Use 'id' instead of 'documentId'
      await unlikeMutation({
        variables: { id: propertyId } // CHANGED: documentId → id
      });

      const newLikedProperties = likedProperties.filter(id => id !== propertyId);
      setLikedProperties(newLikedProperties);
      localStorage.setItem(`likedProperties_${user.id}`, JSON.stringify(newLikedProperties));

      return { success: true };
    } catch (error) {
      console.error('Error unliking property:', error);
      return { success: false, error: error.message };
    }
  };

  // ... rest of the hook
};