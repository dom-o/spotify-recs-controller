<template lang="html">
  <input
    type="checkbox"
    :checked="checked"
    @change="$emit('toggle', $event.target.checked)"
  >
</template>

<script>
export default {
  name: 'BaseCheckbox',
  props: {
    checked: Boolean,
  },
}
</script>
