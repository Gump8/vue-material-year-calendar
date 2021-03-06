<template>
  <div class="c-wrapper">
    <div class="calendar">
      <div class="calendar__title">{{ monthTitle }}</div>
      <div class="calendar__body">
        <div v-for="(day, key) in 7"
             :key="`title${day}`"
             class="calendar__day day__weektitle"
             :style="{fontSize: weekTitleFontSizeAdjustLang}">{{ showDayTitle(key) }}</div>
        <div v-for="(dayObj, key) in showDays"
             class="calendar__day"
             :class="classList(dayObj, 'toggling')"
             :key="`day${key}`">
          <div @mouseover="dragDay(dayObj)"
               @mousedown.left="mouseDown(dayObj)"
               class="day"
               :class="classList(dayObj, 'active')">{{ dayObj.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import dayjs from 'dayjs'
export default {
  name: 'month-calendar',
  props: {
    activeDates: {
      type: Array,
      default: () => []
    },
    togglingDates: {
      type: Array,
      default: () => []
    },
    month: {
      type: [String, Number],
      default: () => this.$dayjs().month() + 1
    },
    year: {
      type: [String, Number],
      default: () => this.$dayjs().year()
    },
    lang: {
      type: String,
      default: 'en'
    },
    activeClass: {
      type: String,
      default: () => ''
    },
    prefixClass: {
      type: String,
      default: () => 'calendar--active'
    },
    togglingClass: {
      type: String,
      default: () => 'calendar--toggling'
    },
    isMouseDown: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      fullOriginShowDays: [],
      showDays: [],
      firstDay: '' // showDays 数组中每个月 1号 的索引值
    }
  },
  computed: {
    weekTitleFontSizeAdjustLang () {
      const fontSizeMapping = {
        tw: '16px',
        en: '14px',
        pt: '14px',
        de: '14px',
        es: '14px',
        pl: '12px'
      }
      return fontSizeMapping[this.lang]
    },
    monthTitle () {
      const monthMapping = {
        tw: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
      }
      return monthMapping[this.lang][this.month - 1]
    }
  },
  methods: {
    initCalendar () {
      if (!this.year || !this.month) return []
      const activeMonth = this.$dayjs().set('date', 1).set('year', this.year).set('month', this.month - 1)
      let firstDay = activeMonth.startOf('month').day() - 1
      if (firstDay < 0) firstDay += 7
      const lastDate = activeMonth.endOf('month').date()
      const weekRow = firstDay >= 5 ? 6 : 5
      this.firstDay = firstDay
      const WEEK = 7
      let day = 0
      this.fullOriginShowDays = Array.from(Array(weekRow * WEEK).keys()).map(i => {
        let value = firstDay <= i ? day++ % lastDate + 1 : ''
        const isOtherMonth = firstDay > i || day > lastDate
        return {
          value,
          active: false,
          toggling: false,
          isOtherMonth,
          dateStr: value && !isOtherMonth ? this.$dayjs().set('year', this.year).set('month', this.month - 1).set('date', value).format('YYYY-MM-DD') : ''
        }
      })
      this.initDateClassName(this.activeDates)
    },
    initDateClassName (nVal, type = 'active') {
      // 把 toggleDate 的內容合併在 initCalendar 裡。
      this.resetDateClass(type)
      nVal.forEach(date => {
        let oDate
        if (typeof date === 'string') {
          oDate = {
            date: date,
            className: this.activeClass
          }
        } else if (typeof date === 'object') {
          oDate = date
        }
        let dayjsObj = this.$dayjs(oDate.date)
        if (dayjsObj.year() !== this.year) return
        let activeDate = dayjsObj.date()
        let row = Math.floor(activeDate / 7)
        let activeArrayKey = (activeDate % 7) - 1 + this.firstDay + 7 * row
        this.showDays[activeArrayKey][type] = true // to array index
        this.showDays[activeArrayKey].className = oDate.togglingClassName
      })
    },
    resetDateClass (type) {
      // this.showDays = JSON.parse(JSON.stringify(this.fullOriginShowDays))
      this.showDays = this.fullOriginShowDays.map(item => {
        item[type] = false
        return item
      })
    },
    showDayTitle (day) {
      const dayMapping = {
        tw: ['一', '二', '三', '四', '五', '六', '日'],
        en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        pt: ['2ª', '3ª', '4ª', '5ª', '6ª', 'Sa', 'Do'],
        de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
        pl: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie']
      }
      return dayMapping[this.lang][day]
    },
    toggleDay ({ dayObj, isToggleDateFirst }) {
      if (dayObj.isOtherMonth) return
      this.$emit('toggleDate', {
        month: this.month,
        date: dayObj.value,
        selected: !dayObj.active,
        className: this.activeClass,
        isToggleDateFirst
      })
    },
    dragDay (dayObj) {
      if (this.isMouseDown) this.toggleDay({ dayObj, isToggleDateFirst: false })
    },
    mouseDown (dayObj) {
      this.toggleDay({ dayObj, isToggleDateFirst: true })
      // this.isMouseDown = true
      this.$emit('update:isMouseDown', true)
    },
    classList (dayObj, type = 'active') {
      let oClassList = {
        'calendar__day--otherMonth': dayObj.isOtherMonth
      }
      if (type === 'active') {
        oClassList[this.prefixClass] = dayObj.active
        if (dayObj.active && dayObj.className) oClassList[dayObj.className] = true
      }
      if (type === 'toggling') {
        oClassList[this.togglingClass] = dayObj.toggling
        if (dayObj.toggling && dayObj.togglingClassName) oClassList[dayObj.togglingClassName] = true
      }
      return oClassList
    }
  },
  watch: {
    year (val) {
      this.initCalendar()
    },
    // 外層來的資料有變化時
    activeDates (nVal) {
      if (!(nVal instanceof Array)) return
      this.initDateClassName(nVal, 'active')
    },
    togglingDates (nVal) {
      if (!(nVal instanceof Array)) return
      this.initDateClassName(nVal, 'toggling')
    }
  },
  created () {
    this.initCalendar()
  }

}
</script>

<style lang="stylus" scoped>
.c-wrapper {
  padding: 10px;
}

.calendar {
  background-color: #fff;
  min-height: 295px;
  text-align: center;
  color: rgba(#353C46, 0.8);
  border-radius: 2px;
  min-width: 0;
  position: relative;
  text-decoration: none;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;

  // &:hover
  // z-index: 2
  // @media (min-width: 1024px)
  // transform: scale(1.15)
  // box-shadow 0 7px 21px 0 rgba(0,0,0,.1)
  .calendar__title {
    font-weight: bold;
    flex: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(#C4C4C4, 0.3);
    font-size: 18px;
    height: 50px;
    margin-bottom: 12px;
  }

  .calendar__body {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    padding: 0px 20px;
    min-width: 194px;
  }

  .calendar__day {
    flex: 14.28%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    height: 27px;
    margin: 2px 0;
    color: #5DB3D4;

    &.calendar--toggling {
      background-color: rgba(#666, 0.1);
    }
  }

  .day__weektitle {
    color: rgba(#353C46, 0.8);
  }

  .day {
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    width: 22px;
    height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 5px;

    &:after {
      content: '';
      display: block;
      height: 10px;
      width: 10px;
      position: absolute;
      top: -5px;
      right: -5px;
      border-radius: 50%;
      z-index: 1;
      background-color: transparent;
    }

    &.calendar--active:after {
      background-image: url('../assets/baseline-remove_circle-24px.svg');
      background-size: 100% 100%;
    }

    &:not(.calendar__day--otherMonth):hover {
      background-color: rgba(#666, 0.1);
      border-radius: 5px;
    }

    &.calendar--active {
      background-color: rgba(#FFBABA, 0.5);
      color: #BCBCBC;

      &.info {
        background-color: rgba(#17a2b8, 0.8);
        color: #fff;

        &:after {
          background-image: url('../assets/RecordIt.svg');
          background-size: 100% 100%;
        }
      }

      &.warning {
        background-color: rgba(#ffc107, 0.7);
        color: #fff;

        &:after {
          background-image: url('../assets/round-warning-24px.svg');
          background-color: rgba(#eaeaea, 0.3);
          background-size: 100% 100%;
        }
      }
    }
  }

  & .calendar__day--otherMonth {
    color: #eaeaea;
    cursor: auto;
  }
}
</style>
