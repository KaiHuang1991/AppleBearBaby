import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

export default function CollectionScreen() {
  const navigation = useNavigation()
  const { products, categories, idsForProduct } = useShop()
  const [search, setSearch] = useState('')
  const [selectedCatIds, setSelectedCatIds] = useState(() => new Set())
  const [sortType, setSortType] = useState('relevant')

  const toggleCat = (id) => {
    setSelectedCatIds((prev) => {
      const next = new Set(prev)
      const s = String(id)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = products.slice()
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((p) => (p.name || '').toLowerCase().includes(q))
    if (selectedCatIds.size > 0) {
      list = list.filter((p) => {
        const ids = idsForProduct(p)
        return ids.some((id) => selectedCatIds.has(String(id)))
      })
    }
    if (sortType === 'low-high') list.sort((a, b) => a.price - b.price)
    if (sortType === 'high-low') list.sort((a, b) => b.price - a.price)
    return list
  }, [products, search, selectedCatIds, sortType, idsForProduct])

  const renderItem = ({ item }) => {
    const img = Array.isArray(item.image) && item.image[0] ? item.image[0] : null
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Product', { productId: item._id })}
      >
        {img ? <Image source={{ uri: img }} style={styles.rowImg} /> : <View style={styles.rowImg} />}
        <View style={styles.rowBody}>
          <Text numberOfLines={2} style={styles.rowTitle}>
            {item.name}
          </Text>
          <Text style={styles.rowPrice}>${item.price}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.root}>
      <TextInput
        style={styles.search}
        placeholder="Search products"
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#94a3b8"
      />
      <View style={styles.sortRow}>
        {[
          { id: 'relevant', label: 'Default' },
          { id: 'low-high', label: 'Price ↑' },
          { id: 'high-low', label: 'Price ↓' },
        ].map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.sortChip, sortType === s.id && styles.sortChipOn]}
            onPress={() => setSortType(s.id)}
          >
            <Text style={[styles.sortChipText, sortType === s.id && styles.sortChipTextOn]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Categories (tap to filter)</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(c) => String(c.id || c._id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        renderItem={({ item }) => {
          const id = String(item.id || item._id)
          const on = selectedCatIds.has(id)
          return (
            <TouchableOpacity
              style={[styles.catChip, on && styles.catChipOn]}
              onPress={() => toggleCat(id)}
            >
              <Text style={[styles.catChipText, on && styles.catChipTextOn]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(p) => String(p._id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        ListEmptyComponent={<Text style={styles.empty}>No products match.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  search: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  sortRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  sortChipOn: { backgroundColor: '#2563eb' },
  sortChipText: { color: '#475569', fontWeight: '600', fontSize: 13 },
  sortChipTextOn: { color: '#fff' },
  sectionLabel: { paddingHorizontal: 16, marginBottom: 6, color: '#64748b', fontSize: 13 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    maxWidth: 160,
  },
  catChipOn: { backgroundColor: '#dbeafe' },
  catChipText: { color: '#334155', fontWeight: '600', fontSize: 13 },
  catChipTextOn: { color: '#1d4ed8' },
  row: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowImg: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#e2e8f0' },
  rowBody: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  rowPrice: { marginTop: 6, fontSize: 16, color: '#2563eb', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 24 },
})
