import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { ScreenContainer, CategoryGrid } from "@/components";
import { categories, COLORS } from "@/constants";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

/**
 * Categories tab — lets the customer browse the full category list and
 * jump straight into a filtered product listing for the one they tap.
 */
export default function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleCategoryPress = (category: Category) => {
    navigation.navigate("Products", { category: category.name });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>
            Browse everything MG Supermart stocks, by category
          </Text>
        </View>
      }
      bottomTabOffset
    >
      <CategoryGrid
        categories={categories}
        onCategoryPress={handleCategoryPress}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

