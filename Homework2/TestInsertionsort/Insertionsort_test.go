package sort

import "testing"

func Insertionsort(array []int) []int{
    var pre int
    /*len() helps to calculate length of an array*/
	for i := 1; i < len(array); i++ {
		pre = i - 1
		current := array[i]
		for ; pre >= 0 && array[pre] > current; {
			array[pre + 1] = array[pre]
			pre--
		}
		array[pre + 1] = current
	}

	return array
}

func TestInsertionsort(t *testing.T) {
    values := []int {8, 6, 3, 7, 5, 4, 9, 1, 10, 2}
    /*use slice instead of array itself*/
	result := Insertionsort(values[:])
	expected := []int {1, 2, 3, 4, 5, 6, 7, 8, 9 ,10}

    /*deal with exception*/
	if len(expected) != len(result) {
		t.Errorf("length of result expected %d but got %d", len(expected), len(result))
	}

	for i := 0; i < len(expected); i++ {
		if result[i] != expected[i]{
			t.Errorf("the %dth value expected %d but got %d", i+1, expected[i], result[i])
		}
	}
}
