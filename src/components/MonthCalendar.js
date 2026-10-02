import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from './icons';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Calendrier mensuel simple, à deux usages :
 *  - Éditeur de disponibilités (prestataire) : `markedDates` + `onDayPress` pour
 *    bloquer/débloquer — chaque date reste cliquable.
 *  - Sélecteur de date (devis) : `disabledDates` (ex: dates indisponibles,
 *    jamais cliquables) + `selectedDate` (mise en évidence ambre) + `onDayPress`.
 */
export default function MonthCalendar({ markedDates = [], disabledDates = [], selectedDate, onDayPress, disablePast = true }) {
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = lundi
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const changeMonth = (delta) => setViewDate(new Date(year, month + delta, 1));

  return (
    <View className="rounded-xl border border-gray-100 bg-white p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable onPress={() => changeMonth(-1)} className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          <ChevronLeft size={16} />
        </Pressable>
        <Text className="font-semibold text-gray-900">{MONTH_NAMES[month]} {year}</Text>
        <Pressable onPress={() => changeMonth(1)} className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          <ChevronRight size={16} />
        </Pressable>
      </View>

      <View className="mb-1 flex-row">
        {WEEKDAYS.map((w) => (
          <View key={w} className="flex-1 items-center"><Text className="text-[10px] font-semibold text-gray-400">{w}</Text></View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={{ width: '14.28%' }} className="h-11" />;
          const dateStr = toDateStr(year, month, day);
          const isPast = disablePast && dateStr < todayStr;
          const isUnavailable = disabledDates.includes(dateStr);
          const isMarked = markedDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const disabled = isPast || isUnavailable || !onDayPress;
          return (
            <Pressable
              key={dateStr}
              disabled={disabled}
              onPress={() => onDayPress(dateStr)}
              style={{ width: '14.28%' }}
              className="h-11 items-center justify-center"
            >
              <View className={`h-8 w-8 items-center justify-center rounded-full ${isSelected ? 'bg-amber-600' : isMarked || isUnavailable ? 'bg-red-500' : ''}`}>
                <Text className={`text-xs ${isPast ? 'text-gray-300' : isSelected || isMarked || isUnavailable ? 'font-semibold text-white' : 'text-gray-700'}`}>
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {onDayPress ? (
        <Text className="mt-3 text-center text-[11px] text-gray-400">
          {disabledDates.length > 0 ? 'Les dates en rouge ne sont pas disponibles.' : 'Appuyez sur une date pour la bloquer/débloquer'}
        </Text>
      ) : (
        <View className="mt-3 flex-row items-center justify-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <Text className="text-[11px] text-gray-400">Dates indisponibles</Text>
        </View>
      )}
    </View>
  );
}
